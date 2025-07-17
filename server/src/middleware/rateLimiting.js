import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import cache from '../config/cache.js';
import logger from '../config/logger.js';

// Custom rate limit store using Redis
class RedisStore {
  constructor() {
    this.prefix = 'rl:';
  }

  async increment(key) {
    const fullKey = this.prefix + key;
    
    try {
      const current = await cache.client?.multi()
        .incr(fullKey)
        .expire(fullKey, 900) // 15 minutes
        .exec();
      
      if (current && current[0] && current[0][1]) {
        return {
          totalHits: current[0][1],
          resetTime: new Date(Date.now() + 900000)
        };
      }
    } catch (error) {
      logger.error('Redis rate limit error:', error);
    }
    
    // Fallback to memory (not persistent across restarts)
    return { totalHits: 1, resetTime: new Date(Date.now() + 900000) };
  }

  async decrement(key) {
    const fullKey = this.prefix + key;
    try {
      await cache.client?.decr(fullKey);
    } catch (error) {
      logger.error('Redis rate limit decrement error:', error);
    }
  }

  async resetKey(key) {
    const fullKey = this.prefix + key;
    try {
      await cache.client?.del(fullKey);
    } catch (error) {
      logger.error('Redis rate limit reset error:', error);
    }
  }
}

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: cache.isConnected ? new RedisStore() : undefined,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url === '/api/health';
  }
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: cache.isConnected ? new RedisStore() : undefined,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Spotify API rate limiting (to avoid hitting their limits)
export const spotifyRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute (Spotify allows way more, but this prevents abuse)
  message: {
    error: 'Too many music search requests, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: cache.isConnected ? new RedisStore() : undefined,
});

// File upload rate limiting
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: cache.isConnected ? new RedisStore() : undefined,
});

// Slow down middleware for progressive delays
export const progressiveSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // max delay of 20 seconds
  store: cache.isConnected ? new RedisStore() : undefined,
});

// Per-user rate limiting middleware
export const createUserRateLimit = (maxRequests = 1000, windowMs = 15 * 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
    },
    message: {
      error: 'You have exceeded your request limit, please try again later.',
      retryAfter: Math.ceil(windowMs / 60000) + ' minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: cache.isConnected ? new RedisStore() : undefined,
  });
};

// Premium user bypass middleware
export const premiumBypass = (req, res, next) => {
  // Premium users get higher limits
  if (req.user?.subscription_status === 'active') {
    return next();
  }
  
  // Apply standard rate limiting for free users
  return createUserRateLimit(100, 15 * 60 * 1000)(req, res, next);
};