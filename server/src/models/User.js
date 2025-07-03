import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export const User = {
  async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(`
      SELECT u.*, v.id as venue_id, v.name as venue_name 
      FROM users u 
      LEFT JOIN venues v ON u.venue_id = v.id 
      WHERE u.id = $1
    `, [id]);
    return result.rows[0];
  },

  async updateSubscription(userId, subscriptionData) {
    const { status, plan, stripeCustomerId, subscriptionId, expiresAt } = subscriptionData;
    await pool.query(`
      UPDATE users 
      SET subscription_status = $1, subscription_plan = $2, 
          stripe_customer_id = $3, subscription_id = $4, expires_at = $5
      WHERE id = $6
    `, [status, plan, stripeCustomerId, subscriptionId, expiresAt, userId]);
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};

export default User;