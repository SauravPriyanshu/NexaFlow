const express = require('express');
const { runAI } = require('./ai.controller');
const { validateAI } = require('./ai.validator');
const authenticate = require('../../shared/middleware/authenticate');
const { aiRateLimiter } = require('../../shared/middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /ai:
 *   post:
 *     summary: Run an AI operation
 *     tags: [AI]
 *     description: Rate limited to 10 requests per minute per user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, input]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [summarize,generate_docs,explain_code,improve_text,convert_tasks,generate_readme]
 *               input:
 *                 type: object
 *                 description: Varies by type. See description below.
 *                 example:
 *                   text: "Meeting notes content here..."
 *                   type: "meeting_notes"
 *     responses:
 *       200:
 *         description: AI result
 *       429:
 *         description: Rate limit exceeded (10/min/user)
 */
router.post('/', authenticate, aiRateLimiter, validateAI, runAI);

module.exports = router;
