const express = require('express');
const router = express.Router();
const authenticate = require('../../shared/middleware/authenticate');
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  updateTaskStatus,
  reorderTasks,
  deleteTask,
  updateChecklist,
  getMyTasks
} = require('./task.controller');

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, projectId, orgId]
 *             properties:
 *               title: { type: string, example: Implement caching layer }
 *               description: { type: string }
 *               projectId: { type: string }
 *               orgId: { type: string }
 *               assignees: { type: array, items: { type: string } }
 *               priority: { type: string, enum: [low,medium,high,urgent] }
 *               labels: { type: array, items: { type: string } }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /tasks/project/{projectId}:
 *   get:
 *     summary: Get all tasks for a project, grouped by status
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo,in_progress,review,testing,done] }
 *       - in: query
 *         name: priority
 *         schema: { type: string }
 *       - in: query
 *         name: assignee
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tasks grouped by status columns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     todo: { type: array, items: { $ref: '#/components/schemas/Task' } }
 *                     in_progress: { type: array, items: { $ref: '#/components/schemas/Task' } }
 *                     review: { type: array, items: { $ref: '#/components/schemas/Task' } }
 *                     testing: { type: array, items: { $ref: '#/components/schemas/Task' } }
 *                     done: { type: array, items: { $ref: '#/components/schemas/Task' } }
 */

router.get('/me', authenticate, getMyTasks);
router.post('/', authenticate, createTask);
router.get('/project/:projectId', authenticate, getTasksByProject);
router.get('/:taskId', authenticate, getTaskById);
router.patch('/:taskId', authenticate, updateTask);
router.patch('/:taskId/status', authenticate, updateTaskStatus);
router.patch('/project/:projectId/reorder', authenticate, reorderTasks);
router.delete('/:taskId', authenticate, deleteTask);
router.patch('/:taskId/checklist', authenticate, updateChecklist);

module.exports = router;
