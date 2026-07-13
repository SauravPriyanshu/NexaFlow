const express = require('express');
const router = express.Router();
const authenticate = require('../../shared/middleware/authenticate');
const {
  sendMessage,
  getMessages,
  markAsRead,
  editMessage,
  reactMessage,
  deleteMessage,
  searchMessages
} = require('./chat.controller');

router.post('/', authenticate, sendMessage);
router.get('/:channelId/search', authenticate, searchMessages);
router.get('/:channelId', authenticate, getMessages);
router.patch('/:messageId/read', authenticate, markAsRead);
router.patch('/:messageId', authenticate, editMessage);
router.patch('/:messageId/react', authenticate, reactMessage);
router.delete('/:messageId', authenticate, deleteMessage);

module.exports = router;
