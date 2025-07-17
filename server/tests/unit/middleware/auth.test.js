import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../../src/models/User.js', () => ({
  User: {
    findById: jest.fn()
  }
}));
jest.mock('../../../src/config/env.js', () => ({
  default: {
    JWT_SECRET: 'test-secret'
  }
}));

describe('Auth Middleware', () => {
  let authMiddleware;
  let mockReq, mockRes, mockNext;

  beforeEach(async () => {
    authMiddleware = await import('../../../src/middleware/auth.js');
    
    mockReq = {
      headers: {},
      user: null
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should authenticate valid token', async () => {
      const mockUser = { ...global.testUser };
      const { User } = await import('../../../src/models/User.js');
      
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ id: 1 });
      User.findById.mockResolvedValue(mockUser);

      await authMiddleware.protect(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(User.findById).toHaveBeenCalledWith(1);
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      await authMiddleware.protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware.protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when user not found', async () => {
      const { User } = await import('../../../src/models/User.js');
      
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ id: 999 });
      User.findById.mockResolvedValue(null);

      await authMiddleware.protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', async () => {
      mockReq.headers.authorization = 'InvalidFormat';

      await authMiddleware.protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('restrictTo middleware', () => {
    it('should allow access for authorized role', () => {
      mockReq.user = { ...global.testAdmin };
      
      const middleware = authMiddleware.restrictTo('admin', 'venue');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      mockReq.user = { ...global.testUser };
      
      const middleware = authMiddleware.restrictTo('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow multiple valid roles', () => {
      mockReq.user = { role: 'venue' };
      
      const middleware = authMiddleware.restrictTo('admin', 'venue', 'user');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('requireSubscription middleware', () => {
    it('should allow access for active subscription', () => {
      mockReq.user = { 
        ...global.testUser,
        subscription_status: 'active' 
      };

      authMiddleware.requireSubscription(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for inactive subscription', () => {
      mockReq.user = { 
        ...global.testUser,
        subscription_status: 'inactive' 
      };

      authMiddleware.requireSubscription(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Active subscription required' 
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for cancelled subscription', () => {
      mockReq.user = { 
        ...global.testUser,
        subscription_status: 'cancelled' 
      };

      authMiddleware.requireSubscription(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Active subscription required' 
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});