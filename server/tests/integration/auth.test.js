import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock the database and external services
jest.mock('../../src/config/database.js', () => ({
  connectDB: jest.fn(),
  default: {
    query: jest.fn()
  }
}));

jest.mock('../../src/services/analyticsService.js', () => ({
  initializeAnalytics: jest.fn()
}));

describe('Auth API Integration Tests', () => {
  let app;
  let mockPool;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Import the app after mocks are set up
    const serverModule = await import('../../src/index.js');
    app = serverModule.default || serverModule.app;
    
    const dbModule = await import('../../src/config/database.js');
    mockPool = dbModule.default;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      mockPool.query.mockResolvedValue({ rows: [newUser] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      });
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User'
          // missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject registration with duplicate email', async () => {
      mockPool.query.mockRejectedValue({
        code: '23505', // PostgreSQL unique violation
        constraint: 'users_email_key'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });

    it('should enforce rate limiting on registration', async () => {
      // Make multiple rapid requests
      const requests = Array(6).fill().map(() => 
        request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
          })
      );

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const existingUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: '$2a$12$hashedpassword',
        role: 'user'
      };

      mockPool.query.mockResolvedValue({ rows: [existingUser] });
      
      // Mock bcrypt comparison
      const bcrypt = await import('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        name: 'Test User',
        email: 'test@example.com'
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject login with invalid credentials', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with wrong password', async () => {
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        password: '$2a$12$hashedpassword'
      };

      mockPool.query.mockResolvedValue({ rows: [existingUser] });
      
      const bcrypt = await import('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const user = { ...global.testUser };
      mockPool.query.mockResolvedValue({ rows: [user] });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should reject request for non-existent user', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const token = jwt.sign({ id: 999 }, process.env.JWT_SECRET);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('User not found');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      // Override the cache mock to simulate high request count
      const cache = await import('../../src/config/cache.js');
      cache.default.client.multi = jest.fn(() => ({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([[null, 6], [null, 'OK']]) // 6th request
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many authentication attempts');
    });
  });
});