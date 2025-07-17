import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.role = data.role || 'USER';
    this.subscriptionStatus = data.subscriptionStatus || 'FREE';
    this.stripeCustomerId = data.stripeCustomerId;
    this.profileImage = data.profileImage;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastLogin = data.lastLogin;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Crear usuario
  static async create(userData) {
    try {
      // Hash password if provided
      let passwordHash = userData.passwordHash;
      if (userData.password) {
        passwordHash = await bcrypt.hash(userData.password, 12);
      }

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash,
          role: userData.role || 'USER',
          subscriptionStatus: userData.subscriptionStatus || 'FREE',
          stripeCustomerId: userData.stripeCustomerId,
          profileImage: userData.profileImage,
          isActive: userData.isActive !== undefined ? userData.isActive : true
        }
      });

      return new User(user);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Buscar por email
  static async findByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          ownedVenues: true,
          sessions: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      
      return user ? new User(user) : null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          ownedVenues: true,
          sessions: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      
      return user ? new User(user) : null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Obtener todos los usuarios (con paginación)
  static async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    try {
      // Build where clause
      const where = {
        isActive: true,
        ...(filters.role && { role: filters.role }),
        ...(filters.subscriptionStatus && { subscriptionStatus: filters.subscriptionStatus }),
        ...(filters.search && {
          OR: [
            { email: { contains: filters.search, mode: 'insensitive' } }
          ]
        })
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            ownedVenues: true,
            _count: {
              select: { sessions: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.user.count({ where })
      ]);

      return {
        users: users.map(user => new User(user)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  // Actualizar usuario
  async update(updateData) {
    try {
      // Hash password if provided
      if (updateData.password) {
        updateData.passwordHash = await bcrypt.hash(updateData.password, 12);
        delete updateData.password;
      }

      const updatedUser = await prisma.user.update({
        where: { id: this.id },
        data: updateData,
        include: {
          ownedVenues: true,
          sessions: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      Object.assign(this, updatedUser);
      return this;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Eliminar usuario (soft delete)
  async delete() {
    try {
      await prisma.user.update({
        where: { id: this.id },
        data: { isActive: false }
      });
      
      this.isActive = false;
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Actualizar suscripción
  async updateSubscription(subscriptionData) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: this.id },
        data: {
          subscriptionStatus: subscriptionData.subscriptionStatus,
          stripeCustomerId: subscriptionData.stripeCustomerId
        }
      });

      Object.assign(this, updatedUser);
      return this;
    } catch (error) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }
  }

  // Obtener estadísticas de usuarios
  static async getStats() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [totalUsers, premiumUsers, venueOwners, admins, activeSubscriptions, newUsersMonth] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: true, subscriptionStatus: 'PREMIUM' } }),
        prisma.user.count({ where: { isActive: true, role: 'VENUE_OWNER' } }),
        prisma.user.count({ where: { isActive: true, role: 'ADMIN' } }),
        prisma.user.count({ where: { isActive: true, subscriptionStatus: { in: ['PREMIUM', 'ENTERPRISE'] } } }),
        prisma.user.count({ where: { isActive: true, createdAt: { gte: thirtyDaysAgo } } })
      ]);

      return {
        totalUsers,
        premiumUsers,
        venueOwners,
        admins,
        activeSubscriptions,
        newUsersMonth
      };
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }

  // Obtener venues del usuario (si es venue owner)
  async getVenues() {
    if (this.role !== 'VENUE_OWNER') {
      return [];
    }

    try {
      const venues = await prisma.venue.findMany({
        where: {
          ownerId: this.id,
          isActive: true
        },
        include: {
          commercials: {
            where: { isActive: true },
            select: { id: true }
          },
          playlists: {
            where: { isActive: true },
            select: { id: true }
          },
          sessions: {
            select: { id: true, connectedUsers: true }
          },
          _count: {
            select: {
              commercials: true,
              playlists: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return venues;
    } catch (error) {
      throw new Error(`Error getting user venues: ${error.message}`);
    }
  }

  // Método para serializar (quitar password)
  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Verificar si el usuario tiene acceso premium
  hasPremiumAccess() {
    return this.subscriptionStatus === 'PREMIUM' || this.subscriptionStatus === 'ENTERPRISE';
  }

  // Verificar si puede acceder a funcionalidades de venue
  canAccessVenue(venueId) {
    return this.role === 'ADMIN' || (this.role === 'VENUE_OWNER' && this.hasVenueAccess(venueId));
  }

  // Verificar acceso específico a venue
  async hasVenueAccess(venueId) {
    try {
      const venue = await prisma.venue.findFirst({
        where: {
          id: parseInt(venueId),
          ownerId: this.id,
          isActive: true
        }
      });
      
      return !!venue;
    } catch (error) {
      return false;
    }
  }
}

  // Validar contraseña
  async validatePassword(password) {
    try {
      return await bcrypt.compare(password, this.passwordHash);
    } catch (error) {
      throw new Error(`Error validating password: ${error.message}`);
    }
  }

  // Actualizar último login
  async updateLastLogin() {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: this.id },
        data: { lastLogin: new Date() }
      });
      
      this.lastLogin = updatedUser.lastLogin;
      return this;
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }
}

export default User;