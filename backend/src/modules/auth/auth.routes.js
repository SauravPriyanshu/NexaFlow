const express = require('express');
const router = express.Router();

const { validateRegister, validateLogin, validate } = require('./auth.validator');
const { register, verifyEmail, login, refresh, logout, googleLogin, resendVerification } = require('./auth.controller');
const authenticate = require('../../shared/middleware/authenticate');
const passport = require('../../config/passport');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Johnson
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alex@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: StrongPass123!
 *                 description: Min 8 chars, must include uppercase and number
 *     responses:
 *       201:
 *         description: Registration successful. Verification email sent.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Email already registered
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: refreshToken httpOnly cookie (7 day expiry)
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT valid for 15 minutes
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using httpOnly cookie
 *     tags: [Auth]
 *     security: []
 *     description: Reads refreshToken from httpOnly cookie. Rotates token on each call.
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string }
 *       401:
 *         description: No refresh token or token invalid/expired
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out and invalidate refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

router.post('/register', validateRegister, validate, register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', validateLogin, validate, login);
router.post('/google', googleLogin);

// Redirect to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: process.env.CLIENT_URL + '/login?error=oauth' }),
  async (req, res) => {
    const { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } = require('../../shared/utils/generateTokens.js');
    const accessToken = generateAccessToken(req.user._id, req.user.email);
    const refreshToken = generateRefreshToken(req.user._id);
    // hash and store refresh token
    const bcrypt = require('bcryptjs');
    req.user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await req.user.save();
    setRefreshTokenCookie(res, refreshToken);
    // Redirect to frontend with access token in URL hash (not query param)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback#token=${accessToken}`);
  }
);

router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);

module.exports = router;
