const isDev = process.env.NODE_ENV === 'development';

const logger = {
  info: (msg, data) => {
    if (isDev) console.log(`[INFO] ${msg}`, data || '');
  },
  error: (msg, err) => {
    console.error(`[ERROR] ${msg}`, err?.message || err || '');
  },
  warn: (msg, data) => {
    console.warn(`[WARN] ${msg}`, data || '');
  }
};

module.exports = { logger };
