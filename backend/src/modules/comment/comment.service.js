const Comment = require('./comment.model');
const Task = require('../task/task.model');
const Project = require('../project/project.model');
const User = require('../user/user.model');
const ApiError = require('../../shared/utils/ApiError');
const eventBus = require('../../shared/utils/eventBus');
const { getIO } = require('../../shared/socket/socket');
const { logActivity } = require('../activity/activity.service');
const { sanitizeHtml } = require('../../shared/utils/sanitize');

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const extractMentions = async (content) => {
  const mentionRegex = /@(\w+)/g;
  const matches = [...content.matchAll(mentionRegex)].map(m => m[1]);
  if (matches.length === 0) return [];

  // This is a simplistic approach; matching by first name or exact username
  // For production, maybe a unique username field is better
  const users = await User.find({ name: { $in: matches.map(m => new RegExp(`^${escapeRegExp(m)}`, 'i')) } });
  return users.map(u => u._id);
};

const createComment = async ({ content, taskId, projectId, authorId, parentId }) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const isMember = project.members.some(m => m.userId.toString() === authorId.toString());
  if (!isMember) throw new ApiError(403, 'You must be a member to comment');

  const mentions = await extractMentions(content);

  const comment = new Comment({
    content: sanitizeHtml(content),
    taskId,
    projectId,
    authorId,
    parentId: parentId || null,
    mentions
  });

  await comment.save();
  await comment.populate('authorId', 'name avatar email');

  await Task.findByIdAndUpdate(taskId, { $inc: { commentCount: 1 } });

  eventBus.emit('comment:created', { comment, actorId: authorId });

  mentions.forEach(mentionedUserId => {
    eventBus.emit('user:mentioned', { userId: mentionedUserId, comment, actorId: authorId });
  });

  try {
    const io = getIO();
    io.to(`project:${projectId}`).emit('comment:new', comment);
  } catch (err) {}

  await logActivity({
    orgId: task.orgId,
    projectId,
    actorId: authorId,
    action: 'add_comment',
    entityType: 'comment',
    entityId: comment._id,
    entityName: 'Comment',
    metadata: { taskId, content: content.substring(0, 50) + (content.length > 50 ? '...' : '') }
  });

  return comment;
};

const getCommentsByTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const project = await Project.findById(task.projectId);
  const isMember = project && project.members.some(m => m.userId.toString() === userId.toString());
  if (!isMember) throw new ApiError(403, 'You do not have access to these comments');

  // Fetch all comments for the task
  const allComments = await Comment.find({ taskId })
    .populate('authorId', 'name avatar email')
    .sort({ createdAt: 1 })
    .lean(); // Lean for easier manipulation

  // Nest replies
  const commentMap = new Map();
  const topLevel = [];

  allComments.forEach(c => {
    c.replies = [];
    commentMap.set(c._id.toString(), c);
  });

  allComments.forEach(c => {
    if (c.parentId) {
      const parent = commentMap.get(c.parentId.toString());
      if (parent) {
        parent.replies.push(c);
      }
    } else {
      topLevel.push(c);
    }
  });

  return topLevel;
};

const updateComment = async (commentId, userId, content) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.authorId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only edit your own comments');
  }

  if (comment.isDeleted) {
    throw new ApiError(400, 'Cannot edit a deleted comment');
  }

  comment.content = sanitizeHtml(content);
  comment.isEdited = true;
  comment.mentions = await extractMentions(content);
  await comment.save();

  await comment.populate('authorId', 'name avatar email');

  try {
    const io = getIO();
    io.to(`project:${comment.projectId}`).emit('comment:updated', comment);
  } catch (err) {}

  return comment;
};

const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const project = await Project.findById(comment.projectId);
  const isManager = project && project.members.some(m => m.userId.toString() === userId.toString() && m.role === 'manager');
  const isAuthor = comment.authorId.toString() === userId.toString();

  if (!isAuthor && !isManager) {
    throw new ApiError(403, 'Only the author or a project manager can delete this comment');
  }

  const hasReplies = await Comment.exists({ parentId: commentId });

  if (hasReplies) {
    // Soft delete
    comment.isDeleted = true;
    comment.content = '[deleted]';
    await comment.save();
  } else {
    // Hard delete
    await Comment.findByIdAndDelete(commentId);
  }

  await Task.findByIdAndUpdate(comment.taskId, { $inc: { commentCount: -1 } });

  eventBus.emit('comment:deleted', { comment, actorId: userId });

  return { deleted: true };
};

const toggleLike = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const alreadyLiked = comment.likes.some(id => id.toString() === userId.toString());

  if (alreadyLiked) {
    comment.likes.pull(userId);
    comment.likeCount = Math.max(0, (comment.likeCount || 1) - 1);
  } else {
    comment.likes.push(userId);
    comment.likeCount = (comment.likeCount || 0) + 1;
  }

  await comment.save();
  await comment.populate('authorId', 'name avatar email');

  try {
    const io = getIO();
    io.to(`project:${comment.projectId}`).emit('comment:updated', comment);
  } catch (err) {}

  return comment;
};

module.exports = {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
  toggleLike
};
