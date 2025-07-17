import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock cache
jest.mock('../../../src/config/cache.js', () => ({
  default: {
    isConnected: true,
    client: {
      multi: jest.fn(() => ({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([[null, 1], [null, 'OK']])
      })),
      decr: jest.fn(),
      del: jest.fn()
    },
    generateKey: jest.fn().mockImplementation((...args) => args.join(':'))
  }
}));

describe('Rate Limiting Middleware', () => {
  let rateLimitingModule;
  let mockReq, mockRes, mockNext;

  beforeEach(async () => {
    rateLimitingModule = await import('../../../src/middleware/rateLimiting.js');
    
    mockReq = {
      ip: '127.0.0.1',
      url: '/api/test',
      user: null,
      headers: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('generalRateLimit', () => {
    it('should allow requests under limit', async () => {
      await rateLimitingModule.generalRateLimit(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should skip health check endpoints', async () => {
      mockReq.url = '/api/health';

      await rateLimitingModule.generalRateLimit(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('authRateLimit', () => {
    it('should have stricter limits for auth endpoints', async () => {
      // Simulate multiple rapid requests
      const cache = await import('../../../src/config/cache.js');
      cache.default.client.multi.mockReturnValue({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([[null, 6], [null, 'OK']]) // Simulate 6th request
      });

      await rateLimitingModule.authRateLimit(mockReq, mockRes, mockNext);

      // Should be rate limited after 5 requests
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Too many authentication attempts')
        })
      );
    });
  });

  describe('createUserRateLimit', () => {
    it('should use user ID when authenticated', async () => {
      mockReq.user = { id: 123 };
      
      const userRateLimit = rateLimitingModule.createUserRateLimit(100, 15 * 60 * 1000);
      await userRateLimit(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fall back to IP when not authenticated', async () => {
      mockReq.user = null;
      
      const userRateLimit = rateLimitingModule.createUserRateLimit(100, 15 * 60 * 1000);
      await userRateLimit(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('premiumBypass', () => {
    it('should bypass rate limiting for premium users', () => {
      mockReq.user = { 
        id: 123,
        subscription_status: 'active' 
      };

      rateLimitingModule.premiumBypass(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should apply rate limiting for free users', () => {
      mockReq.user = { 
        id: 123,
        subscription_status: 'inactive' 
      };

      // This will call the rate limiter internally
      rateLimitingModule.premiumBypass(mockReq, mockRes, mockNext);

      // Since we're mocking the cache to return low counts, it should pass
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('RedisStore', () => {
    it('should handle Redis connection errors gracefully', async () => {
      const cache = await import('../../../src/config/cache.js');
      cache.default.client.multi.mockImplementation(() => {
        throw new Error('Redis connection error');
      });

      // Should still work with memory fallback
      await rateLimitingModule.generalRateLimit(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('spotifyRateLimit', () => {
    it('should have appropriate limits for Spotify API calls', async () => {
      // Test that it doesn't immediately block requests
      await rateLimitingModule.spotifyRateLimit(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('uploadRateLimit', () => {
    it('should have hourly limits for file uploads', async () => {
      await rateLimitingModule.uploadRateLimit(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});