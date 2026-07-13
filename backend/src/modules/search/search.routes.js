const express = require('express');
const { search } = require('./search.controller');
const authenticate = require('../../shared/middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * /search/{orgId}:
 *   get:
 *     summary: Global search across an organization
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search results containing tasks, projects, etc.
 */
router.get('/:orgId', authenticate, search);

module.exports = router;
