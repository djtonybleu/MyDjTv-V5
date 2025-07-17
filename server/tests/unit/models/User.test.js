import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('../../../src/config/database.js', () => ({
  default: {
    query: jest.fn()
  }
}));

describe('User Model', () => {
  let User, mockPool;

  beforeEach(async () => {
    const userModule = await import('../../../src/models/User.js');
    User = userModule.User;
    
    const dbModule = await import('../../../src/config/database.js');
    mockPool = dbModule.default;
    
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const hashedPassword = 'hashed_password';
      const createdUser = { id: 1, ...userData, password: hashedPassword };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      mockPool.query.mockResolvedValue({ rows: [createdUser] });

      const result = await User.create(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Test User', 'test@example.com', hashedPassword, 'user']
      );
      expect(result).toEqual(createdUser);
    });

    it('should use default role when not provided', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      bcrypt.hash.mockResolvedValue('hashed_password');
      mockPool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await User.create(userData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['Test User', 'test@example.com', 'hashed_password', 'user'])
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = { ...global.testUser };
      mockPool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByEmail('test@example.com');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await User.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find user by id with venue information', async () => {
      const mockUser = {
        ...global.testUser,
        venue_id: 1,
        venue_name: 'Test Venue'
      };
      mockPool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findById(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN venues'),
        [1]
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await User.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('updateSubscription', () => {
    it('should update user subscription data', async () => {
      const subscriptionData = {
        status: 'active',
        plan: 'premium',
        stripeCustomerId: 'cus_123',
        subscriptionId: 'sub_123',
        expiresAt: new Date('2024-12-31')
      };

      mockPool.query.mockResolvedValue({ rows: [] });

      await User.updateSubscription(1, subscriptionData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [
          'active',
          'premium', 
          'cus_123',
          'sub_123',
          subscriptionData.expiresAt,
          1
        ]
      );
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const result = await User.comparePassword('password123', 'hashed_password');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await User.comparePassword('wrong_password', 'hashed_password');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', 'hashed_password');
      expect(result).toBe(false);
    });
  });
});