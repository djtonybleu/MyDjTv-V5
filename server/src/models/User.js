const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.role = data.role || 'user';
    this.is_premium = data.is_premium || false;
    this.stripe_customer_id = data.stripe_customer_id;
    this.subscription_id = data.subscription_id;
    this.subscription_status = data.subscription_status || 'inactive';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear usuario
  static async create(userData) {
    const query = `
      INSERT INTO users (email, password, name, role, is_premium, subscription_status) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const values = [
      userData.email,
      userData.password,
      userData.name,
      userData.role || 'user',
      userData.is_premium || false,
      userData.subscription_status || 'inactive'
    ];

    try {
      const result = await pool.query(query, values);
      return new User(result.rows[0]);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Buscar por email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Buscar por ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Obtener todos los usuarios (con paginación)
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM users';
    let countQuery = 'SELECT COUNT(*) FROM users';
    const values = [];
    let whereClause = '';

    // Aplicar filtros
    if (filters.role) {
      whereClause += ' WHERE role = $1';
      values.push(filters.role);
    }

    if (filters.is_premium !== undefined) {
      whereClause += values.length > 0 ? ' AND is_premium = $' + (values.length + 1) : ' WHERE is_premium = $1';
      values.push(filters.is_premium);
    }

    if (filters.search) {
      const searchClause = values.length > 0 ? 
        ` AND (name ILIKE $${values.length + 1} OR email ILIKE $${values.length + 2})` : 
        ` WHERE (name ILIKE $1 OR email ILIKE $2)`;
      whereClause += searchClause;
      values.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += whereClause + ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    countQuery += whereClause;

    try {
      const [dataResult, countResult] = await Promise.all([
        pool.query(query, [...values, limit, offset]),
        pool.query(countQuery, values)
      ]);

      return {
        users: dataResult.rows.map(row => new User(row)),
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  // Actualizar usuario
  async update(updateData) {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    // Construir query dinámicamente
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${valueIndex}`);
        values.push(updateData[key]);
        valueIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Agregar updated_at
    fields.push(`updated_at = $${valueIndex}`);
    values.push(new Date());
    valueIndex++;

    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${valueIndex} 
      RETURNING *
    `;
    values.push(this.id);

    try {
      const result = await pool.query(query, values);
      if (result.rows[0]) {
        Object.assign(this, result.rows[0]);
        return this;
      }
      return null;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Eliminar usuario
  async delete() {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    
    try {
      const result = await pool.query(query, [this.id]);
      return result.rows[0] ? true : false;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Actualizar suscripción
  async updateSubscription(subscriptionData) {
    const query = `
      UPDATE users 
      SET 
        is_premium = $1,
        stripe_customer_id = $2,
        subscription_id = $3,
        subscription_status = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 
      RETURNING *
    `;

    const values = [
      subscriptionData.is_premium,
      subscriptionData.stripe_customer_id,
      subscriptionData.subscription_id,
      subscriptionData.subscription_status,
      this.id
    ];

    try {
      const result = await pool.query(query, values);
      if (result.rows[0]) {
        Object.assign(this, result.rows[0]);
        return this;
      }
      return null;
    } catch (error) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }
  }

  // Obtener estadísticas de usuarios
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_premium = true THEN 1 END) as premium_users,
        COUNT(CASE WHEN role = 'venue' THEN 1 END) as venue_owners,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
      FROM users
    `;

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }

  // Obtener venues del usuario (si es venue owner)
  async getVenues() {
    if (this.role !== 'venue') {
      return [];
    }

    const query = `
      SELECT v.*, 
        COUNT(DISTINCT a.id) as total_analytics,
        COUNT(DISTINCT c.id) as total_commercials
      FROM venues v
      LEFT JOIN analytics a ON v.id = a.venue_id
      LEFT JOIN commercials c ON v.id = c.venue_id
      WHERE v.owner_id = $1
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `;

    try {
      const result = await pool.query(query, [this.id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting user venues: ${error.message}`);
    }
  }

  // Método para serializar (quitar password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Verificar si el usuario tiene acceso premium
  hasPremiumAccess() {
    return this.is_premium && this.subscription_status === 'active';
  }

  // Verificar si puede acceder a funcionalidades de venue
  canAccessVenue(venueId) {
    return this.role === 'admin' || (this.role === 'venue' && this.hasVenueAccess(venueId));
  }

  // Verificar acceso específico a venue
  async hasVenueAccess(venueId) {
    const query = 'SELECT id FROM venues WHERE id = $1 AND owner_id = $2';
    
    try {
      const result = await pool.query(query, [venueId, this.id]);
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = User;