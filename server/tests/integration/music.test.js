import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock external services
jest.mock('axios');
jest.mock('../../src/config/database.js', () => ({
  connectDB: jest.fn(),
  default: {
    query: jest.fn()
  }
}));

jest.mock('../../src/services/analyticsService.js', () => ({
  initializeAnalytics: jest.fn()
}));

describe('Music API Integration Tests', () => {
  let app;
  let mockPool;
  let authToken;
  let premiumToken;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Import the app after mocks are set up
    const serverModule = await import('../../src/index.js');
    app = serverModule.default || serverModule.app;
    
    const dbModule = await import('../../src/config/database.js');
    mockPool = dbModule.default;

    // Create auth tokens for testing
    authToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
    premiumToken = jwt.sign({ id: 2 }, process.env.JWT_SECRET);

    // Mock user lookup for auth
    mockPool.query.mockImplementation((query, params) => {
      if (query.includes('SELECT u.*') && params[0] === 1) {
        return { rows: [{ ...global.testUser }] };
      }
      if (query.includes('SELECT u.*') && params[0] === 2) {
        return { rows: [{ ...global.testAdmin, subscription_status: 'active' }] };
      }
      return { rows: [] };
    });
  });

  describe('GET /api/music/search', () => {
    it('should search tracks successfully for premium users', async () => {
      const axios = await import('axios');
      
      // Mock Spotify token request
      axios.post.mockResolvedValue({
        data: { access_token: 'spotify_token', expires_in: 3600 }
      });

      // Mock Spotify search response
      axios.get.mockResolvedValue({
        data: {
          tracks: {
            items: [{
              id: 'track123',
              name: 'Test Song',
              artists: [{ name: 'Test Artist' }],
              album: {
                name: 'Test Album',
                images: [{ url: 'https://example.com/image.jpg' }]
              },
              duration_ms: 180000,
              popularity: 75,
              explicit: false
            }]
          }
        }
      });

      const response = await request(app)
        .get('/api/music/search')
        .query({ q: 'test song' })
        .set('Authorization', `Bearer ${premiumToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album'
      });
    });

    it('should reject search for non-premium users', async () => {
      const response = await request(app)
        .get('/api/music/search')
        .query({ q: 'test song' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Active subscription required');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/music/search')
        .query({ q: 'test song' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });

    it('should apply rate limiting', async () => {
      // Override cache mock for rate limiting
      const cache = await import('../../src/config/cache.js');
      cache.default.client.multi = jest.fn(() => ({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([[null, 31], [null, 'OK']]) // 31st request
      }));

      const response = await request(app)
        .get('/api/music/search')
        .query({ q: 'test song' })
        .set('Authorization', `Bearer ${premiumToken}`);

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many music search requests');
    });

    it('should return cached results when available', async () => {
      const cache = await import('../../src/config/cache.js');
      const cachedResults = [{ id: 'cached', title: 'Cached Song' }];
      
      cache.default.get.mockResolvedValue(cachedResults);

      const response = await request(app)
        .get('/api/music/search')
        .query({ q: 'test song' })
        .set('Authorization', `Bearer ${premiumToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedResults);
    });
  });

  describe('GET /api/music/tracks/:id', () => {
    it('should get track details', async () => {
      const axios = await import('axios');
      
      // Mock Spotify responses
      axios.post.mockResolvedValue({
        data: { access_token: 'spotify_token', expires_in: 3600 }
      });

      axios.get.mockResolvedValue({
        data: {
          id: 'track123',
          name: 'Test Song',
          artists: [{ name: 'Test Artist' }],
          album: {
            name: 'Test Album',
            images: [{ url: 'https://example.com/image.jpg' }]
          },
          duration_ms: 180000,
          popularity: 75,
          explicit: false
        }
      });

      const response = await request(app)
        .get('/api/music/tracks/spotify:track123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album'
      });
    });

    it('should handle track not found', async () => {
      const axios = await import('axios');
      
      axios.post.mockResolvedValue({
        data: { access_token: 'spotify_token', expires_in: 3600 }
      });

      axios.get.mockRejectedValue(new Error('Track not found'));

      const response = await request(app)
        .get('/api/music/tracks/spotify:nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/music/playlists', () => {
    it('should get user playlists', async () => {
      const mockPlaylists = [
        { id: 1, name: 'My Playlist', genre: 'rock', is_active: true }
      ];

      mockPool.query.mockResolvedValue({ rows: mockPlaylists });

      const response = await request(app)
        .get('/api/music/playlists')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPlaylists);
    });

    it('should cache playlist results', async () => {
      const cache = await import('../../src/config/cache.js');
      const cachedPlaylists = [{ id: 1, name: 'Cached Playlist' }];
      
      cache.default.get.mockResolvedValue(cachedPlaylists);

      const response = await request(app)
        .get('/api/music/playlists')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedPlaylists);
      expect(response.headers['x-cache']).toBe('HIT');
    });
  });

  describe('POST /api/music/playlists', () => {
    it('should create new playlist', async () => {
      const newPlaylist = {
        id: 1,
        name: 'New Playlist',
        genre: 'pop',
        venue_id: 1,
        is_active: false
      };

      mockPool.query.mockResolvedValue({ rows: [newPlaylist] });

      const response = await request(app)
        .post('/api/music/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Playlist',
          genre: 'pop',
          venue_id: 1
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'New Playlist',
        genre: 'pop'
      });
    });

    it('should validate playlist data', async () => {
      const response = await request(app)
        .post('/api/music/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/music/playlists/:id', () => {
    it('should update playlist', async () => {
      const updatedPlaylist = {
        id: 1,
        name: 'Updated Playlist',
        genre: 'jazz',
        is_active: true
      };

      mockPool.query.mockResolvedValue({ rows: [updatedPlaylist] });

      const response = await request(app)
        .put('/api/music/playlists/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Playlist',
          genre: 'jazz',
          is_active: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Updated Playlist',
        genre: 'jazz'
      });
    });

    it('should handle playlist not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .put('/api/music/playlists/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Playlist'
        });

      expect(response.status).toBe(404);
    });
  });
});