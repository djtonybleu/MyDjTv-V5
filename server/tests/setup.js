import { jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/mydjtv_test';
process.env.REDIS_URL = 'redis://localhost:6379/1'; // Use different Redis DB for tests
process.env.SPOTIFY_CLIENT_ID = 'test_client_id';
process.env.SPOTIFY_CLIENT_SECRET = 'test_client_secret';

// Global test timeout
jest.setTimeout(10000);

// Mock external services by default
jest.mock('../src/config/cache.js', () => ({
  default: {
    isConnected: false,
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
    exists: jest.fn().mockResolvedValue(false),
    generateKey: jest.fn().mockImplementation((...args) => args.join(':')),
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true)
  }
}));

// Mock logger to avoid console spam in tests
jest.mock('../src/config/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock queue service
jest.mock('../src/services/queueService.js', () => ({
  addFileProcessingJob: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
  addEmailJob: jest.fn().mockResolvedValue({ id: 'test-email-job-id' }),
  getQueueStats: jest.fn().mockResolvedValue({
    fileProcessing: { waiting: 0, active: 0, completed: 0, failed: 0 },
    email: { waiting: 0, active: 0, completed: 0, failed: 0 }
  }),
  closeQueues: jest.fn().mockResolvedValue(true)
}));

// Global test helpers
global.testUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  subscription_status: 'inactive'
};

global.testAdmin = {
  id: 2,
  name: 'Test Admin',
  email: 'admin@example.com',
  role: 'admin',
  subscription_status: 'active'
};

global.testVenue = {
  id: 1,
  name: 'Test Venue',
  type: 'restaurant',
  location: 'Test City',
  owner_id: 2
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});