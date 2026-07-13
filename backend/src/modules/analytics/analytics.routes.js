const express = require('express');
const controller = require('./analytics.controller');
const authenticate = require('../../shared/middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * /analytics/org/{orgId}/overview:
 *   get:
 *     summary: Get high-level overview stats for an organization
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Overview stats
 */

/**
 * @swagger
 * /analytics/project/{projectId}/stats:
 *   get:
 *     summary: Get project task statistics
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project stats
 */

/**
 * @swagger
 * /analytics/project/{projectId}/completion:
 *   get:
 *     summary: Get task completion trend over time
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Completion trend data
 */

/**
 * @swagger
 * /analytics/project/{projectId}/members:
 *   get:
 *     summary: Get member productivity stats for a project
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member stats
 */

/**
 * @swagger
 * /analytics/org/{orgId}/weekly:
 *   get:
 *     summary: Get weekly progress for the organization
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Weekly progress data
 */

/**
 * @swagger
 * /analytics/task/{taskId}/activity:
 *   get:
 *     summary: Get activity history for a task
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task activity logs
 */
router.get('/org/:orgId/overview', authenticate, controller.getOrgOverview);
router.get('/project/:projectId/stats', authenticate, controller.getProjectStats);
router.get('/project/:projectId/completion', authenticate, controller.getTaskCompletionOverTime);
router.get('/project/:projectId/members', authenticate, controller.getMemberProductivity);
router.get('/org/:orgId/weekly', authenticate, controller.getWeeklyProgress);
router.get('/task/:taskId/activity', authenticate, controller.getTaskActivity);

module.exports = router;
