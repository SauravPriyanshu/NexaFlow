const authService = require('./auth.service');
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require('../../shared/utils/generateTokens');
const ApiResponse = require('../../shared/utils/ApiResponse');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, result, 'Registration successful'));
  } catch (err) {
    //Global Error Handler
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    await authService.verifyEmail(token);
    res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
  } catch (err) {
    //Global Error Handler
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationEmail(email);
    res.status(200).json(new ApiResponse(200, result, 'Verification email sent'));
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.loginUser(req.body);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json(new ApiResponse(200, { accessToken, user }, 'Logged in successfully'));
  } catch (err) {
    //Global Error Handler
    next(err);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      throw new require('../../shared/utils/ApiError')(400, 'Missing Google credential');
    }
    const { accessToken, refreshToken, user } = await authService.loginWithGoogle(credential);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json(new ApiResponse(200, { accessToken, user }, 'Logged in with Google successfully'));
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { accessToken, newRefreshToken, user } = await authService.refreshAccessToken(refreshToken);
    setRefreshTokenCookie(res, newRefreshToken);
    res.status(200).json(new ApiResponse(200, { accessToken, user }, 'Token refreshed successfully'));
  } catch (err) {
    //Global Error Handler
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    // Assuming req.user is set by authentication middleware
    await authService.logoutUser(req.user._id);
    clearRefreshTokenCookie(res);
    res.status(200).json(new ApiResponse(200, null, 'Logged out'));
  } catch (err) {
    //Global Error Handler
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    // TODO: Implement change password
    res.status(200).json(new ApiResponse(200, null, 'Not implemented yet'));
  } catch (err) {
    //Global Error Handler
    next(err);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  googleLogin,
  refresh,
  logout,
  changePassword,
};
