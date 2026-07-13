const express = require('express');
const router = express.Router();
const authenticate = require('../../shared/middleware/authenticate');
const {
  createProject,
  getProjectsByOrg,
  getProjectById,
  updateProject,
  deleteProject,
  toggleFavorite,
  addProjectMember,
  removeProjectMember,
  updateProjectStatuses
} = require('./project.controller');

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, orgId]
 *             properties:
 *               name: { type: string }
 *               orgId: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Project created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /projects/org/{orgId}:
 *   get:
 *     summary: Get all projects for an organization
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of projects
 */

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project details
 *   patch:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Project updated
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project deleted
 */

/**
 * @swagger
 * /projects/{projectId}/favorite:
 *   patch:
 *     summary: Toggle favorite status for a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Favorite toggled
 */

/**
 * @swagger
 * /projects/{projectId}/members:
 *   post:
 *     summary: Add a member to the project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, role]
 *             properties:
 *               userId: { type: string }
 *               role: { type: string }
 *     responses:
 *       200:
 *         description: Member added
 */

/**
 * @swagger
 * /projects/{projectId}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from the project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member removed
 */

/**
 * @swagger
 * /projects/{projectId}/statuses:
 *   patch:
 *     summary: Update project task statuses (kanban columns)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statuses: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Statuses updated
 */
router.post('/', authenticate, createProject);
router.get('/org/:orgId', authenticate, getProjectsByOrg);
router.get('/:projectId', authenticate, getProjectById);
router.patch('/:projectId', authenticate, updateProject);
router.patch('/:projectId/statuses', authenticate, updateProjectStatuses);
router.delete('/:projectId', authenticate, deleteProject);
router.patch('/:projectId/favorite', authenticate, toggleFavorite);
router.post('/:projectId/members', authenticate, addProjectMember);
router.delete('/:projectId/members/:memberId', authenticate, removeProjectMember);

module.exports = router;
