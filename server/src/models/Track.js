import prisma from '../config/database.js';

class Track {
  constructor(data) {
    this.id = data.id;
    this.spotifyId = data.spotifyId;
    this.title = data.title;
    this.artist = data.artist;
    this.album = data.album;
    this.duration = data.duration;
    this.previewUrl = data.previewUrl;
    this.albumArt = data.albumArt;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.playCount = data.playCount || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Crear o actualizar track
  static async create(trackData) {
    try {
      const track = await prisma.track.upsert({
        where: { spotifyId: trackData.spotifyId },
        update: {
          title: trackData.title,
          artist: trackData.artist,
          album: trackData.album,
          duration: trackData.duration,
          previewUrl: trackData.previewUrl,
          albumArt: trackData.albumArt,
          isActive: true
        },
        create: {
          spotifyId: trackData.spotifyId,
          title: trackData.title,
          artist: trackData.artist,
          album: trackData.album,
          duration: trackData.duration,
          previewUrl: trackData.previewUrl,
          albumArt: trackData.albumArt,
          isActive: true,
          playCount: 0
        }
      });
      
      return new Track(track);
    } catch (error) {
      throw new Error(`Error creating track: ${error.message}`);
    }
  }

  // Buscar track por ID
  static async findById(id) {
    try {
      const track = await prisma.track.findUnique({
        where: { id: parseInt(id) }
      });
      
      return track ? new Track(track) : null;
    } catch (error) {
      throw new Error(`Error finding track by ID: ${error.message}`);
    }
  }

  // Buscar track por Spotify ID
  static async findBySpotifyId(spotifyId) {
    try {
      const track = await prisma.track.findUnique({
        where: { spotifyId }
      });
      
      return track ? new Track(track) : null;
    } catch (error) {
      throw new Error(`Error finding track by Spotify ID: ${error.message}`);
    }
  }

  // Buscar tracks con paginación
  static async search(query, page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    
    try {
      const where = {
        isActive: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { artist: { contains: query, mode: 'insensitive' } },
            { album: { contains: query, mode: 'insensitive' } }
          ]
        }),
        ...(filters.artist && {
          artist: { contains: filters.artist, mode: 'insensitive' }
        }),
        ...(filters.album && {
          album: { contains: filters.album, mode: 'insensitive' }
        })
      };

      const [tracks, total] = await Promise.all([
        prisma.track.findMany({
          where,
          orderBy: [
            { playCount: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.track.count({ where })
      ]);

      return {
        tracks: tracks.map(track => new Track(track)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Error searching tracks: ${error.message}`);
    }
  }

  // Obtener tracks populares
  static async getPopular(limit = 20) {
    try {
      const tracks = await prisma.track.findMany({
        where: { isActive: true },
        orderBy: { playCount: 'desc' },
        take: limit
      });
      
      return tracks.map(track => new Track(track));
    } catch (error) {
      throw new Error(`Error getting popular tracks: ${error.message}`);
    }
  }

  // Obtener tracks recientes
  static async getRecent(limit = 20) {
    try {
      const tracks = await prisma.track.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      
      return tracks.map(track => new Track(track));
    } catch (error) {
      throw new Error(`Error getting recent tracks: ${error.message}`);
    }
  }

  // Incrementar contador de reproducciones
  async incrementPlays() {
    try {
      const updatedTrack = await prisma.track.update({
        where: { id: this.id },
        data: { playCount: { increment: 1 } }
      });
      
      this.playCount = updatedTrack.playCount;
      return this;
    } catch (error) {
      throw new Error(`Error incrementing plays: ${error.message}`);
    }
  }

  // Actualizar track
  async update(updateData) {
    try {
      const updatedTrack = await prisma.track.update({
        where: { id: this.id },
        data: updateData
      });

      Object.assign(this, updatedTrack);
      return this;
    } catch (error) {
      throw new Error(`Error updating track: ${error.message}`);
    }
  }

  // Eliminar track (soft delete)
  async delete() {
    try {
      await prisma.track.update({
        where: { id: this.id },
        data: { isActive: false }
      });
      
      this.isActive = false;
      return true;
    } catch (error) {
      throw new Error(`Error deleting track: ${error.message}`);
    }
  }

  // Obtener estadísticas de tracks
  static async getStats() {
    try {
      const [totalTracks, totalPlays, topArtists] = await Promise.all([
        prisma.track.count({ where: { isActive: true } }),
        prisma.track.aggregate({
          where: { isActive: true },
          _sum: { playCount: true }
        }),
        prisma.track.groupBy({
          by: ['artist'],
          where: { isActive: true },
          _count: { artist: true },
          _sum: { playCount: true },
          orderBy: { _sum: { playCount: 'desc' } },
          take: 10
        })
      ]);

      return {
        totalTracks,
        totalPlays: totalPlays._sum.playCount || 0,
        topArtists: topArtists.map(artist => ({
          name: artist.artist,
          trackCount: artist._count.artist,
          totalPlays: artist._sum.playCount || 0
        }))
      };
    } catch (error) {
      throw new Error(`Error getting track stats: ${error.message}`);
    }
  }

  // Crear múltiples tracks en batch
  static async createBatch(tracksData) {
    try {
      const tracks = await prisma.track.createMany({
        data: tracksData.map(track => ({
          spotifyId: track.spotifyId,
          title: track.title,
          artist: track.artist,
          album: track.album,
          duration: track.duration,
          previewUrl: track.previewUrl,
          albumArt: track.albumArt,
          isActive: true,
          playCount: 0
        })),
        skipDuplicates: true
      });
      
      return tracks;
    } catch (error) {
      throw new Error(`Error creating tracks batch: ${error.message}`);
    }
  }
}

export default Track;