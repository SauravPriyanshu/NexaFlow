const express = require('express');
const authenticate = require('../../shared/middleware/authenticate');
const commentController = require('./comment.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', commentController.createComment);
router.get('/task/:taskId', commentController.getCommentsByTask);
router.patch('/:commentId', commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);
router.patch('/:commentId/like', commentController.toggleLike);

module.exports = router;
