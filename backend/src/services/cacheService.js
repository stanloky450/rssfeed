import { getRedisClient } from '../config/redis.js';

const DEFAULT_EXPIRY = parseInt(process.env.CACHE_EXPIRY) || 3600; // 1 hour

/**
 * Get data from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached data or null
 */
export const getCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client || !client.isOpen) {
      return null;
    }

    const data = await client.get(key);
    if (data) {
      console.log(`✅ Cache HIT: ${key}`);
      return JSON.parse(data);
    }

    console.log(`❌ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error('Error getting cache:', error.message);
    return null;
  }
};

/**
 * Set data in Redis cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expiry - Expiry time in seconds (default: 3600)
 * @returns {Promise<boolean>} - Success status
 */
export const setCache = async (key, data, expiry = DEFAULT_EXPIRY) => {
  try {
    const client = getRedisClient();
    if (!client || !client.isOpen) {
      return false;
    }

    await client.setEx(key, expiry, JSON.stringify(data));
    console.log(`✅ Cache SET: ${key} (expires in ${expiry}s)`);
    return true;
  } catch (error) {
    console.error('Error setting cache:', error.message);
    return false;
  }
};

/**
 * Delete data from Redis cache
 * @param {string} key - Cache key or pattern
 * @returns {Promise<boolean>} - Success status
 */
export const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client || !client.isOpen) {
      return false;
    }

    await client.del(key);
    console.log(`✅ Cache DELETE: ${key}`);
    return true;
  } catch (error) {
    console.error('Error deleting cache:', error.message);
    return false;
  }
};

/**
 * Delete all cache entries matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'articles:*')
 * @returns {Promise<number>} - Number of deleted keys
 */
export const deleteCachePattern = async (pattern) => {
  try {
    const client = getRedisClient();
    if (!client || !client.isOpen) {
      return 0;
    }

    const keys = await client.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }

    await client.del(keys);
    console.log(`✅ Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`);
    return keys.length;
  } catch (error) {
    console.error('Error deleting cache pattern:', error.message);
    return 0;
  }
};

/**
 * Invalidate all article-related caches
 * @returns {Promise<void>}
 */
export const invalidateArticleCache = async () => {
  try {
    await deleteCachePattern('articles:*');
    await deleteCachePattern('topics:*');
    await deleteCachePattern('stats:*');
    console.log('✅ Article cache invalidated');
  } catch (error) {
    console.error('Error invalidating article cache:', error.message);
  }
};

/**
 * Generate cache key for articles query
 * @param {Object} query - Query parameters
 * @returns {string} - Cache key
 */
export const generateArticleCacheKey = (query) => {
  const { topic, sentiment, page = 1, limit = 20, search, tags } = query;
  const parts = ['articles'];

  if (topic) parts.push(`topic:${topic}`);
  if (sentiment) parts.push(`sentiment:${sentiment}`);
  if (search) parts.push(`search:${search}`);
  if (tags) parts.push(`tags:${tags}`);
  parts.push(`page:${page}`);
  parts.push(`limit:${limit}`);

  return parts.join(':');
};

/**
 * Cache middleware for Express routes
 * @param {number} expiry - Cache expiry in seconds
 * @returns {Function} - Express middleware
 */
export const cacheMiddleware = (expiry = DEFAULT_EXPIRY) => {
  return async (req, res, next) => {
    try {
      const key = generateArticleCacheKey(req.query);
      const cachedData = await getCache(key);

      if (cachedData) {
        return res.json({
          success: true,
          cached: true,
          ...cachedData,
        });
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = (data) => {
        if (data.success && !data.error) {
          setCache(key, data, expiry).catch(err =>
            console.error('Cache set error:', err)
          );
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
};

export default {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  invalidateArticleCache,
  generateArticleCacheKey,
  cacheMiddleware,
};
