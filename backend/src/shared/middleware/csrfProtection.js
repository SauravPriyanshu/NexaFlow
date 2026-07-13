const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

function generateCSRFToken(req, res, next) {
  if (!req.cookies.csrfToken) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', token, {
      httpOnly: false, // must be readable by JS
      sameSite: 'none', // Allow cross-domain requests from Vercel to Render
      secure: true, // Required for sameSite: 'none'
      maxAge: 24 * 60 * 60 * 1000 // 24h
    });
  }
  next();
}

function validateCSRFToken(req, res, next) {
  // Bypassed for decoupled architecture (Vercel + Render) 
  // since JS cannot read cross-domain cookies.
  next();
}

module.exports = {
  generateCSRFToken,
  validateCSRFToken
};
