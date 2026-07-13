const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

function generateCSRFToken(req, res, next) {
  if (!req.cookies.csrfToken) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', token, {
      httpOnly: false, // must be readable by JS
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24h
    });
  }
  next();
}

function validateCSRFToken(req, res, next) {
  // Skip for GET, HEAD, OPTIONS
  if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();
  // Skip for auth endpoints (they set the cookie)
  if (req.path.startsWith('/auth/')) return next();

  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new ApiError(403, 'CSRF token validation failed'));
  }
  next();
}

module.exports = {
  generateCSRFToken,
  validateCSRFToken
};
