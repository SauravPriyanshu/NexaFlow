const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const ApiError = require('../../shared/utils/ApiError');
const { sendVerificationEmail } = require('../../shared/utils/sendEmail');
const { generateAccessToken, generateRefreshToken } = require('../../shared/utils/generateTokens');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async ({ name, email, password }) => {
  // Check if User with email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Generate verify token
  const rawVerifyToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the verify token before storing
  const hashedVerifyToken = await bcrypt.hash(rawVerifyToken, 10);

  // Set verifyTokenExpiry to 24 hours from now
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create and save User
  const user = new User({
    name,
    email,
    passwordHash,
    isVerified: false,
    verifyToken: hashedVerifyToken,
    verifyTokenExpiry,
  });

  await user.save();

  // Send verification email
  await sendVerificationEmail(email, rawVerifyToken);

  // Return public JSON representation
  return user.toPublicJSON();
};

const verifyEmail = async (token) => {
  // Note: This is intentionally a scan of unverified users. This tradeoff is acceptable
  // because unverified users are relatively few, and the token expiry is short (24h).
  const unverifiedUsers = await User.find({
    isVerified: false,
    verifyTokenExpiry: { $gt: Date.now() },
  });

  let matchedUser = null;

  for (const user of unverifiedUsers) {
    if (user.verifyToken) {
      const isMatch = await bcrypt.compare(token, user.verifyToken);
      if (isMatch) {
        matchedUser = user;
        break;
      }
    }
  }

  if (!matchedUser) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  // Mark as verified and clear tokens
  matchedUser.isVerified = true;
  matchedUser.verifyToken = null;
  matchedUser.verifyTokenExpiry = null;

  await matchedUser.save();

  return matchedUser.toPublicJSON();
};

const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account with that email');
  if (user.isVerified) throw new ApiError(400, 'Email already verified');

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.verifyToken = await bcrypt.hash(rawToken, 10);
  user.verifyTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  await sendVerificationEmail(email, rawToken);
  return { message: 'Verification email sent' };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email before logging in');
  }

  const accessToken = generateAccessToken(user._id, user.email);
  const refreshToken = generateRefreshToken(user._id);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = hashedRefreshToken;
  await user.save();

  return { accessToken, refreshToken, user: user.toPublicJSON() };
};

const loginWithGoogle = async (idToken) => {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new ApiError(401, 'Invalid Google token');
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }
  } else {
    user = new User({
      name,
      email,
      googleId,
      isVerified: true,
      authProvider: 'google',
      avatar: picture,
    });
    await user.save();
  }

  const accessToken = generateAccessToken(user._id, user.email);
  const refreshToken = generateRefreshToken(user._id);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = hashedRefreshToken;
  await user.save();

  return { accessToken, refreshToken, user: user.toPublicJSON() };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Invalid token');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  if (!user.refreshTokenHash) {
    throw new ApiError(401, 'Token mismatch');
  }

  const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isMatch) {
    throw new ApiError(401, 'Token mismatch');
  }

  const accessToken = generateAccessToken(user._id, user.email);
  const newRefreshToken = generateRefreshToken(user._id);

  const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
  user.refreshTokenHash = hashedNewRefreshToken;
  await user.save();

  return { accessToken, newRefreshToken, user: user.toPublicJSON() };
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  return { message: 'Logged out successfully' };
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  loginWithGoogle,
  refreshAccessToken,
  logoutUser,
};
