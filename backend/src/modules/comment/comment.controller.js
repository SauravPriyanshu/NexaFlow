const commentService = require('./comment.service');
const catchAsync = require('../../shared/utils/catchAsync');

const createComment = catchAsync(async (req, res) => {
  const { content, taskId, projectId, parentId } = req.body;
  const authorId = req.user._id;

  if (!content || !taskId || !projectId) {
    return res.status(400).json({ status: 'error', message: 'content, taskId, and projectId are required' });
  }

  const comment = await commentService.createComment({
    content,
    taskId,
    projectId,
    authorId,
    parentId
  });

  res.status(201).json({
    status: 'success',
    data: { comment }
  });
});

const getCommentsByTask = catchAsync(async (req, res) => {
  const { taskId } = req.params;

  const comments = await commentService.getCommentsByTask(taskId, req.user._id);

  res.status(200).json({
    status: 'success',
    data: { comments }
  });
});

const updateComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ status: 'error', message: 'Content is required' });
  }

  const comment = await commentService.updateComment(commentId, req.user._id, content);

  res.status(200).json({
    status: 'success',
    data: { comment }
  });
});

const deleteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;

  await commentService.deleteComment(commentId, req.user._id);

  res.status(200).json({
    status: 'success',
    data: null
  });
});

const toggleLike = catchAsync(async (req, res) => {
  const { commentId } = req.params;

  const comment = await commentService.toggleLike(commentId, req.user._id);

  res.status(200).json({
    status: 'success',
    data: { comment }
  });
});

module.exports = {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
  toggleLike
};
