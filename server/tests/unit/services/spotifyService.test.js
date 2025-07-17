import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock dependencies
jest.mock('../../../src/config/cache.js');
jest.mock('../../../src/config/logger.js');
jest.mock('../../../src/config/env.js', () => ({
  default: {
    SPOTIFY_CLIENT_ID: 'test_client_id',
    SPOTIFY_CLIENT_SECRET: 'test_client_secret'
  }
}));

describe('SpotifyService', () => {
  let spotifyService;

  beforeEach(async () => {
    // Dynamic import to ensure mocks are set up
    spotifyService = await import('../../../src/services/spotifyService.js');
    jest.clearAllMocks();
  });

  describe('getSpotifyToken', () => {
    it('should return cached token when available', async () => {
      const mockCache = await import('../../../src/config/cache.js');
      mockCache.default.get.mockResolvedValue({
        access_token: 'cached_token',
        expires_in: 3600
      });

      // We need to test this indirectly through searchSpotify since getSpotifyToken is not exported
      mockedAxios.get.mockResolvedValue({
        data: {
          tracks: {
            items: []
          }
        }
      });

      await spotifyService.searchSpotify('test query');
      
      // Verify cache was checked
      expect(mockCache.default.get).toHaveBeenCalledWith('spotify:token');
    });

    it('should fetch new token when cache is empty', async () => {
      const mockCache = await import('../../../src/config/cache.js');
      mockCache.default.get.mockResolvedValue(null);
      
      mockedAxios.post.mockResolvedValue({
        data: {
          access_token: 'new_token',
          expires_in: 3600
        }
      });

      mockedAxios.get.mockResolvedValue({
        data: {
          tracks: {
            items: []
          }
        }
      });

      await spotifyService.searchSpotify('test query');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': expect.stringContaining('Basic')
          })
        })
      );
    });
  });

  describe('searchSpotify', () => {
    beforeEach(() => {
      const mockCache = import('../../../src/config/cache.js');
      mockCache.then(cache => {
        cache.default.get.mockResolvedValue(null); // No cache
        cache.default.set.mockResolvedValue(true);
      });
    });

    it('should return formatted search results', async () => {
      const mockTrack = {
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
      };

      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'token', expires_in: 3600 }
      });

      mockedAxios.get.mockResolvedValue({
        data: {
          tracks: {
            items: [mockTrack]
          }
        }
      });

      const result = await spotifyService.searchSpotify('test query', 1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'spotify:track123',
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        thumbnail: 'https://example.com/image.jpg',
        spotifyId: 'track123',
        popularity: 75,
        explicit: false
      });
    });

    it('should return cached search results when available', async () => {
      const mockCache = await import('../../../src/config/cache.js');
      const cachedResults = [{ id: 'cached_track', title: 'Cached Song' }];
      
      mockCache.default.get.mockResolvedValue(cachedResults);

      const result = await spotifyService.searchSpotify('test query');

      expect(result).toEqual(cachedResults);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'token', expires_in: 3600 }
      });

      mockedAxios.get.mockRejectedValue(new Error('Spotify API Error'));

      const result = await spotifyService.searchSpotify('test query');

      expect(result).toEqual([]);
    });

    it('should cache search results', async () => {
      const mockCache = await import('../../../src/config/cache.js');
      
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'token', expires_in: 3600 }
      });

      mockedAxios.get.mockResolvedValue({
        data: { tracks: { items: [] } }
      });

      await spotifyService.searchSpotify('test query');

      expect(mockCache.default.set).toHaveBeenCalledWith(
        'spotify:search:test query:20',
        [],
        600
      );
    });
  });

  describe('getSpotifyTrack', () => {
    it('should return formatted track data', async () => {
      const mockTrack = {
        id: 'track123',
        name: 'Test Song',
        artists: [{ name: 'Artist 1' }, { name: 'Artist 2' }],
        album: {
          name: 'Test Album',
          images: [{ url: 'https://example.com/image.jpg' }]
        },
        duration_ms: 240000,
        popularity: 80,
        explicit: true
      };

      const mockCache = await import('../../../src/config/cache.js');
      mockCache.default.get.mockResolvedValue(null);

      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'token', expires_in: 3600 }
      });

      mockedAxios.get.mockResolvedValue({ data: mockTrack });

      const result = await spotifyService.getSpotifyTrack('spotify:track123');

      expect(result).toEqual({
        id: 'spotify:track123',
        title: 'Test Song',
        artist: 'Artist 1, Artist 2',
        album: 'Test Album',
        duration: 240,
        thumbnail: 'https://example.com/image.jpg',
        spotifyId: 'track123',
        popularity: 80,
        explicit: true
      });
    });

    it('should return cached track when available', async () => {
      const mockCache = await import('../../../src/config/cache.js');
      const cachedTrack = { id: 'spotify:cached', title: 'Cached Track' };
      
      mockCache.default.get.mockResolvedValue(cachedTrack);

      const result = await spotifyService.getSpotifyTrack('spotify:cached');

      expect(result).toEqual(cachedTrack);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should handle track not found', async () => {
      const mockCache = await import('../../../src/config/cache.js');
      mockCache.default.get.mockResolvedValue(null);

      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'token', expires_in: 3600 }
      });

      mockedAxios.get.mockRejectedValue(new Error('Track not found'));

      const result = await spotifyService.getSpotifyTrack('spotify:nonexistent');

      expect(result).toBeNull();
    });
  });
});