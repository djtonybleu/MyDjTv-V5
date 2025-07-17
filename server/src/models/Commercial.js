import prisma from '../config/database.js';

class Commercial {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.audioUrl = data.audioUrl;
    this.duration = data.duration;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.playCount = data.playCount || 0;
    this.settings = data.settings || {};
    this.venueId = data.venueId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    
    // Relations
    this.venue = data.venue;
  }

  // Crear commercial
  static async create(commercialData) {
    try {
      const commercial = await prisma.commercial.create({
        data: {
          title: commercialData.title,
          description: commercialData.description,
          audioUrl: commercialData.audioUrl,
          duration: commercialData.duration,
          venueId: commercialData.venueId,
          settings: commercialData.settings || {
            volume: 80,
            priority: 'medium',
            timeSlots: ['all']
          },
          isActive: true,
          playCount: 0
        },
        include: {
          venue: true
        }
      });
      
      return new Commercial(commercial);
    } catch (error) {
      throw new Error(`Error creating commercial: ${error.message}`);
    }
  }

  // Buscar commercials por venue ID
  static async findByVenueId(venueId) {
    try {
      const commercials = await prisma.commercial.findMany({
        where: { 
          venueId: parseInt(venueId),
          isActive: true
        },
        include: {
          venue: true
        },
        orderBy: [
          { playCount: 'desc' },
          { createdAt: 'desc' }
        ]
      });
      
      return commercials.map(commercial => new Commercial(commercial));
    } catch (error) {
      throw new Error(`Error finding commercials by venue: ${error.message}`);
    }
  }

  // Buscar commercial por ID
  static async findById(id) {
    try {
      const commercial = await prisma.commercial.findUnique({
        where: { id: parseInt(id) },
        include: {
          venue: true
        }
      });
      
      return commercial ? new Commercial(commercial) : null;
    } catch (error) {
      throw new Error(`Error finding commercial by ID: ${error.message}`);
    }
  }

  // Obtener todos los commercials con paginación
  static async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    try {
      const where = {
        isActive: true,
        ...(filters.venueId && { venueId: parseInt(filters.venueId) }),
        ...(filters.search && {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
          ]
        })
      };

      const [commercials, total] = await Promise.all([
        prisma.commercial.findMany({
          where,
          include: {
            venue: true
          },
          orderBy: [
            { playCount: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.commercial.count({ where })
      ]);

      return {
        commercials: commercials.map(commercial => new Commercial(commercial)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Error fetching commercials: ${error.message}`);
    }
  }

  // Actualizar commercial
  async update(updateData) {
    try {
      const updatedCommercial = await prisma.commercial.update({
        where: { id: this.id },
        data: updateData,
        include: {
          venue: true
        }
      });

      Object.assign(this, updatedCommercial);
      return this;
    } catch (error) {
      throw new Error(`Error updating commercial: ${error.message}`);
    }
  }

  // Eliminar commercial (soft delete)
  async delete() {
    try {
      await prisma.commercial.update({
        where: { id: this.id },
        data: { isActive: false }
      });
      
      this.isActive = false;
      return true;
    } catch (error) {
      throw new Error(`Error deleting commercial: ${error.message}`);
    }
  }

  // Incrementar contador de reproducciones
  async incrementPlays() {
    try {
      const updatedCommercial = await prisma.commercial.update({
        where: { id: this.id },
        data: { playCount: { increment: 1 } }
      });
      
      this.playCount = updatedCommercial.playCount;
      return this;
    } catch (error) {
      throw new Error(`Error incrementing plays: ${error.message}`);
    }
  }

  // Obtener commercials más populares
  static async getPopular(limit = 10) {
    try {
      const commercials = await prisma.commercial.findMany({
        where: { isActive: true },
        include: {
          venue: true
        },
        orderBy: { playCount: 'desc' },
        take: limit
      });
      
      return commercials.map(commercial => new Commercial(commercial));
    } catch (error) {
      throw new Error(`Error getting popular commercials: ${error.message}`);
    }
  }

  // Obtener comerciales por slot de tiempo
  static async getByTimeSlot(venueId, timeSlot) {
    try {
      const commercials = await prisma.commercial.findMany({
        where: {
          venueId: parseInt(venueId),
          isActive: true
        },
        include: {
          venue: true
        },
        orderBy: [
          { playCount: 'asc' }, // Rotar commerciales menos reproducidos
          { createdAt: 'desc' }
        ]
      });
      
      // Filtrar por time slot en settings
      const filteredCommercials = commercials.filter(commercial => {
        const settings = commercial.settings || {};
        const timeSlots = settings.timeSlots || ['all'];
        return timeSlots.includes(timeSlot) || timeSlots.includes('all');
      });
      
      return filteredCommercials.map(commercial => new Commercial(commercial));
    } catch (error) {
      throw new Error(`Error getting commercials by time slot: ${error.message}`);
    }
  }

  // Obtener estadísticas de commercials
  static async getStats(venueId = null) {
    try {
      const where = {
        isActive: true,
        ...(venueId && { venueId: parseInt(venueId) })
      };

      const [totalCommercials, totalPlays, avgDuration] = await Promise.all([
        prisma.commercial.count({ where }),
        prisma.commercial.aggregate({
          where,
          _sum: { playCount: true }
        }),
        prisma.commercial.aggregate({
          where,
          _avg: { duration: true }
        })
      ]);

      return {
        totalCommercials,
        totalPlays: totalPlays._sum.playCount || 0,
        avgDuration: Math.round(avgDuration._avg.duration || 0)
      };
    } catch (error) {
      throw new Error(`Error getting commercial stats: ${error.message}`);
    }
  }

  // Obtener próximo commercial para reproducir
  static async getNextForVenue(venueId) {
    try {
      const now = new Date();
      const hour = now.getHours();
      
      let timeSlot = 'all';
      if (hour >= 6 && hour < 12) timeSlot = 'morning';
      else if (hour >= 12 && hour < 18) timeSlot = 'afternoon';
      else if (hour >= 18 && hour < 22) timeSlot = 'evening';
      else timeSlot = 'night';

      const commercials = await this.getByTimeSlot(venueId, timeSlot);
      
      if (commercials.length === 0) {
        return null;
      }

      // Seleccionar commercial con menos reproducciones
      return commercials.sort((a, b) => a.playCount - b.playCount)[0];
    } catch (error) {
      throw new Error(`Error getting next commercial: ${error.message}`);
    }
  }
}

export default Commercial;