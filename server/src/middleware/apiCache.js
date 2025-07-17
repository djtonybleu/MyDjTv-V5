import cache from '../config/cache.js';
import logger from '../config/logger.js';

// API response caching middleware
export const apiCache = (duration = 300, keyFn = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const baseKey = keyFn ? keyFn(req) : req.originalUrl || req.url;
    const userSpecific = req.user?.id ? `user:${req.user.id}` : 'anonymous';
    const cacheKey = cache.generateKey('api', userSpecific, baseKey);

    try {
      // Try to get from cache
      const cachedResponse = await cache.get(cacheKey);
      
      if (cachedResponse) {
        logger.debug('Cache hit', { key: baseKey });
        
        // Set cache headers
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-TTL', Math.floor((cachedResponse.expires - Date.now()) / 1000));
        
        return res.status(cachedResponse.status).json(cachedResponse.data);
      }

      // Cache miss - intercept response
      logger.debug('Cache miss', { key: baseKey });
      res.set('X-Cache', 'MISS');

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseToCache = {
            status: res.statusCode,
            data: data,
            expires: Date.now() + (duration * 1000)
          };

          // Cache asynchronously to not block response
          cache.set(cacheKey, responseToCache, duration).catch(error => {
            logger.error('Failed to cache response:', error);
          });
        }

        // Call original json method
        return originalJson.call(this, data);
      };

    } catch (error) {
      logger.error('Cache middleware error:', error);
    }

    next();
  };
};

// Specific cache configurations for different endpoints
export const venueCache = apiCache(600, (req) => {
  // Cache venues per user for 10 minutes
  return `venues:${req.query.type || 'all'}`;
});

export const analyticsCache = apiCache(300, (req) => {
  // Cache analytics for 5 minutes
  return `analytics:${req.params.id}:${req.query.period || 'day'}`;
});

export const commercialsCache = apiCache(1800, (req) => {
  // Cache commercials for 30 minutes
  return `commercials:${req.user?.venue_id || 'all'}`;
});

export const playlistsCache = apiCache(900, (req) => {
  // Cache playlists for 15 minutes
  return `playlists:${req.user?.id}:${req.query.genre || 'all'}`;
});

// Cache invalidation helpers
export const invalidateUserCache = async (userId, pattern = '*') => {
  try {
    const userKey = cache.generateKey('api', `user:${userId}`, pattern);
    await cache.del(userKey);
    logger.debug('Cache invalidated for user', { userId, pattern });
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
};

export const invalidateVenueCache = async (venueId) => {
  try {
    const patterns = [
      `venues:*`,
      `analytics:${venueId}:*`,
      `commercials:${venueId}:*`
    ];
    
    for (const pattern of patterns) {
      const key = cache.generateKey('api', '*', pattern);
      await cache.del(key);
    }
    
    logger.debug('Cache invalidated for venue', { venueId });
  } catch (error) {
    logger.error('Venue cache invalidation error:', error);
  }
};

export const invalidateCache = async (pattern) => {
  try {
    if (cache.isConnected && cache.client) {
      const keys = await cache.client.keys(`mydjtv:api:*${pattern}*`);
      if (keys.length > 0) {
        await cache.client.del(keys);
        logger.debug('Cache invalidated', { pattern, keysCount: keys.length });
      }
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
};