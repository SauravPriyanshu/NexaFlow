const express = require('express');
const router = express.Router();
const authenticate = require('../../shared/middleware/authenticate');
const {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead
} = require('./notification.controller');

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for current user
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 */

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Unread count
 */

/**
 * @swagger
 * /notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: All notifications marked read
 */

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marked read
 */
router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/mark-all-read', authenticate, markAllRead);
router.patch('/:notificationId/read', authenticate, markNotificationRead);

module.exports = router;
