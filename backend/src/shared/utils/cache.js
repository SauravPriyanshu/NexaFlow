const redis = require('../../config/redis');

const TTL_SHORT = 60;           // 1 min — for frequently changing data
const TTL_MEDIUM = 300;         // 5 min — for moderately stable data
const TTL_LONG = 600;           // 10 min — for stable data like org members
const TTL_VERY_LONG = 3600;     // 1 hour — for near-static data

const getCache = async (key) => {
  try {
    const value = await redis.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (err) {
    console.error(`Redis get error for key ${key}:`, err);
    return null;
  }
};

const setCache = async (key, value, ttlSeconds) => {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    console.error(`Redis set error for key ${key}:`, err);
  }
};

const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`Redis delete error for key ${key}:`, err);
  }
};

const deleteCachePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error(`Redis delete pattern error for pattern ${pattern}:`, err);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  TTL_SHORT,
  TTL_MEDIUM,
  TTL_LONG,
  TTL_VERY_LONG
};
