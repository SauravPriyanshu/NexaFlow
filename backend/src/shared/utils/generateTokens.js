const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    //hackers can't access with document.cookie
    httpOnly: true,
    //protection against CSRF attacks
    sameSite: 'none',
    //only send over HTTPS in production
    secure: true,
    //for how long the cookie should be stored on the client
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  });
};

const clearRefreshTokenCookie = (res) => {
  //used during logout and password reset
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'none',
    secure: true
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie
};
