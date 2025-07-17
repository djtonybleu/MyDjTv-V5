import prisma from '../config/database.js';
import QRCode from 'qrcode';

class Venue {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.address = data.address;
    this.phone = data.phone;
    this.email = data.email;
    this.website = data.website;
    this.logo = data.logo;
    this.qrCode = data.qrCode;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.settings = data.settings || {};
    this.analytics = data.analytics || {};
    this.ownerId = data.ownerId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    
    // Relations
    this.owner = data.owner;
    this.playlists = data.playlists || [];
    this.commercials = data.commercials || [];
    this.sessions = data.sessions || [];
  }

  // Crear venue
  static async create(venueData) {
    try {
      const venue = await prisma.venue.create({
        data: {
          name: venueData.name,
          address: venueData.address,
          phone: venueData.phone,
          email: venueData.email,
          website: venueData.website,
          logo: venueData.logo,
          ownerId: venueData.ownerId,
          settings: venueData.settings || {
            theme: 'modern',
            allowUserRequests: true,
            commercialFrequency: 3,
            maxVolume: 80
          },
          analytics: venueData.analytics || {
            totalPlays: 0,
            uniqueUsers: 0,
            averageSessionTime: 0
          }
        },
        include: {
          owner: true,
          playlists: true,
          commercials: true,
          sessions: true
        }
      });
      
      // Generate QR code
      const qrCodeUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/remote?venue=${venue.id}`;
      const qrCode = await QRCode.toDataURL(qrCodeUrl);
      
      const updatedVenue = await prisma.venue.update({
        where: { id: venue.id },
        data: { qrCode },
        include: {
          owner: true,
          playlists: true,
          commercials: true,
          sessions: true
        }
      });
      
      return new Venue(updatedVenue);
    } catch (error) {
      throw new Error(`Error creating venue: ${error.message}`);
    }
  }

  // Buscar venues por owner ID
  static async findByOwnerId(ownerId) {
    try {
      const venues = await prisma.venue.findMany({
        where: { 
          ownerId: parseInt(ownerId),
          isActive: true
        },
        include: {
          owner: true,
          playlists: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          commercials: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          sessions: {
            orderBy: { lastActivity: 'desc' }
          },
          _count: {
            select: {
              playlists: true,
              commercials: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return venues.map(venue => new Venue(venue));
    } catch (error) {
      throw new Error(`Error finding venues by owner: ${error.message}`);
    }
  }

  // Buscar venue por ID
  static async findById(id) {
    try {
      const venue = await prisma.venue.findUnique({
        where: { id: parseInt(id) },
        include: {
          owner: true,
          playlists: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          commercials: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          sessions: {
            orderBy: { lastActivity: 'desc' }
          }
        }
      });
      
      return venue ? new Venue(venue) : null;
    } catch (error) {
      throw new Error(`Error finding venue by ID: ${error.message}`);
    }
  }

  // Obtener todos los venues con paginación
  static async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    try {
      const where = {
        isActive: true,
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { address: { contains: filters.search, mode: 'insensitive' } }
          ]
        })
      };

      const [venues, total] = await Promise.all([
        prisma.venue.findMany({
          where,
          include: {
            owner: true,
            _count: {
              select: {
                playlists: true,
                commercials: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.venue.count({ where })
      ]);

      return {
        venues: venues.map(venue => new Venue(venue)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Error fetching venues: ${error.message}`);
    }
  }

  // Actualizar venue
  async update(updateData) {
    try {
      const updatedVenue = await prisma.venue.update({
        where: { id: this.id },
        data: updateData,
        include: {
          owner: true,
          playlists: true,
          commercials: true,
          sessions: true
        }
      });

      Object.assign(this, updatedVenue);
      return this;
    } catch (error) {
      throw new Error(`Error updating venue: ${error.message}`);
    }
  }

  // Actualizar analytics
  async updateAnalytics(analyticsData) {
    try {
      const currentAnalytics = this.analytics || {};
      const updatedAnalytics = { ...currentAnalytics, ...analyticsData };
      
      const updatedVenue = await prisma.venue.update({
        where: { id: this.id },
        data: { analytics: updatedAnalytics }
      });

      this.analytics = updatedVenue.analytics;
      return this;
    } catch (error) {
      throw new Error(`Error updating analytics: ${error.message}`);
    }
  }

  // Eliminar venue (soft delete)
  async delete() {
    try {
      await prisma.venue.update({
        where: { id: this.id },
        data: { isActive: false }
      });
      
      this.isActive = false;
      return true;
    } catch (error) {
      throw new Error(`Error deleting venue: ${error.message}`);
    }
  }

  // Obtener estadísticas del venue
  async getStats() {
    try {
      const stats = await prisma.venue.findUnique({
        where: { id: this.id },
        select: {
          analytics: true,
          _count: {
            select: {
              playlists: true,
              commercials: true
            }
          },
          sessions: {
            select: {
              connectedUsers: true,
              lastActivity: true
            }
          }
        }
      });

      const totalConnectedUsers = stats.sessions.reduce((sum, session) => sum + session.connectedUsers, 0);
      const recentActivity = stats.sessions.filter(session => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(session.lastActivity) > oneDayAgo;
      }).length;

      return {
        ...stats.analytics,
        totalPlaylists: stats._count.playlists,
        totalCommercials: stats._count.commercials,
        currentConnectedUsers: totalConnectedUsers,
        recentActivity
      };
    } catch (error) {
      throw new Error(`Error getting venue stats: ${error.message}`);
    }
  }

  // Generar nuevo QR code
  async regenerateQRCode() {
    try {
      const qrCodeUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/remote?venue=${this.id}`;
      const qrCode = await QRCode.toDataURL(qrCodeUrl);
      
      await this.update({ qrCode });
      return qrCode;
    } catch (error) {
      throw new Error(`Error regenerating QR code: ${error.message}`);
    }
  }
}

export default Venue;