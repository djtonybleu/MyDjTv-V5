import { createClient } from 'redis';
import env from './env.js';
import logger from './logger.js';

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = createClient({
        url: env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('✅ Redis Ready');
      });

      this.client.on('end', () => {
        logger.warn('⚠️ Redis Connection Ended');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.warn('⚠️ Redis connection failed, continuing without cache:', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async flush() {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  // Helper methods for common cache patterns
  async remember(key, callback, ttlSeconds = 3600) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await callback();
    await this.set(key, result, ttlSeconds);
    return result;
  }

  // Generate cache keys
  generateKey(prefix, ...parts) {
    return `mydjtv:${prefix}:${parts.join(':')}`;
  }
}

const cache = new CacheService();
export default cache;