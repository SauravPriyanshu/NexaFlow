const rateLimit = require('express-rate-limit');
const redis = require('../../config/redis');
const CACHE_KEYS = require('../utils/cacheKeys');
const ApiError = require('../utils/ApiError');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_GENERAL) || 10000, // Limit each IP to 10000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH) || 100,
  message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiRateLimiter = async (req, res, next) => {
  if (!req.user) return next();
  
  const key = CACHE_KEYS.aiRateLimit(req.user._id);
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, 60);
    }
    if (current > 10) {
      throw new ApiError(429, 'AI rate limit exceeded. Try again in a minute.');
    }
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next();
  }
};

module.exports = {
  generalLimiter,
  authLimiter,
  aiRateLimiter
};
