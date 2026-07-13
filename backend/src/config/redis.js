const Redis = require('ioredis');
const { logger } = require('../shared/utils/logger');

const redisOptions = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  }
};

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisOptions);

redis.on('connect', () => {
  logger.info('Redis connected');
});

let hasLoggedError = false;
redis.on('error', (err) => {
  if (!hasLoggedError) {
    logger.error('Redis connection failed. Graceful degradation active - the app will continue to work without Redis cache.');
    hasLoggedError = true;
  }
});

module.exports = redis;
