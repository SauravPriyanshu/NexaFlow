const Message = require('./message.model');
const { getIO } = require('../../shared/socket/socket');
const ApiError = require('../../shared/utils/ApiError');
const { sanitizeHtml } = require('../../shared/utils/sanitize');

const sendMessage = async ({ channelId, senderId, content, type = 'text', fileUrl, fileName, replyTo }) => {
  const message = new Message({
    channelId,
    senderId,
    content: sanitizeHtml(content),
    type,
    fileUrl,
    fileName,
    // Persist the reply snapshot if provided
    replyTo: replyTo || undefined,
    readBy: [{ userId: senderId, readAt: new Date() }]
  });

  await message.save();
  await message.populate('senderId', 'name email avatar');

  try {
    const io = getIO();
    io.to(`channel:${channelId}`).emit('chat:message', message);
  } catch (err) {
    console.warn('Socket not initialized, message not emitted');
  }

  return message;
};

const getMessages = async (channelId, userId, { cursor, limit = 30 }) => {
  const query = { channelId };
  if (cursor) query._id = { $lt: cursor };

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('senderId', 'name email avatar');

  const nextCursor = messages.length === limit ? messages[messages.length - 1]._id : null;
  const hasMore = messages.length === limit;

  return { messages: messages.reverse(), nextCursor, hasMore };
};

const markAsRead = async (channelId, userId) => {
  await Message.updateMany(
    { channelId, 'readBy.userId': { $ne: userId } },
    { $push: { readBy: { userId, readAt: new Date() } } }
  );
  return { success: true };
};

const editMessage = async (messageId, userId, content) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');
  if (message.senderId.toString() !== userId.toString()) throw new ApiError(403, 'You can only edit your own messages');
  if (message.isDeleted) throw new ApiError(400, 'Cannot edit a deleted message');

  message.content = sanitizeHtml(content);
  message.editedAt = new Date();
  await message.save();
  await message.populate('senderId', 'name email avatar');

  try {
    const io = getIO();
    io.to(`channel:${message.channelId}`).emit('chat:message_edited', message);
  } catch (err) {}

  return message;
};

const reactToMessage = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');
  if (message.isDeleted) throw new ApiError(400, 'Cannot react to a deleted message');

  // Safely parse existing reactions into a native Map
  const reactionsMap = new Map();
  if (message.reactions) {
    const isMongooseMap = message.reactions instanceof Map || typeof message.reactions.get === 'function';
    if (isMongooseMap) {
      for (const [em, users] of message.reactions.entries()) {
        reactionsMap.set(em, users);
      }
    } else {
      for (const [em, users] of Object.entries(message.reactions)) {
        reactionsMap.set(em, users);
      }
    }
  }

  // One reaction per user: remove user from ALL emojis first
  let userHadExactEmoji = false;
  for (const [em, users] of reactionsMap.entries()) {
    const filtered = users.filter(uid => uid.toString() !== userId.toString());
    if (em === emoji && filtered.length < users.length) {
      userHadExactEmoji = true; // They clicked the emoji they already had
    }
    if (filtered.length > 0) reactionsMap.set(em, filtered);
    else reactionsMap.delete(em);
  }

  // If user didn't already have this exact emoji, add it
  if (emoji && !userHadExactEmoji) {
    const existing = reactionsMap.get(emoji) || [];
    reactionsMap.set(emoji, [...existing, userId]);
  }

  // Convert native Map to plain object for Mongoose saving and socket broadcast
  const reactionsObj = {};
  for (const [em, users] of reactionsMap.entries()) {
    reactionsObj[em] = users.map(u => u.toString());
  }

  message.reactions = reactionsObj;
  message.markModified('reactions');
  await message.save();

  try {
    const io = getIO();
    io.to(`channel:${message.channelId}`).emit('chat:reaction_updated', {
      messageId,
      reactions: reactionsObj
    });
  } catch (err) {}

  return reactionsObj;
};

const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId).populate('senderId', 'name');
  if (!message) throw new ApiError(404, 'Message not found');

  const isSelf = message.senderId._id.toString() === userId.toString();

  let deletedByRole = 'self';
  if (!isSelf) {
    try {
      const Project = require('../project/project.model');
      const projectId = message.channelId.replace(/^project:/, '');
      const project = await Project.findById(projectId);
      if (project) {
        const isOwner = project.createdBy.toString() === userId.toString();
        const member = project.members.find(m => m.userId.toString() === userId.toString());
        if (isOwner) deletedByRole = 'owner';
        else if (member?.role === 'manager') deletedByRole = 'admin';
        else throw new ApiError(403, 'You do not have permission to delete this message');
      }
    } catch (err) {
      if (err.statusCode === 403) throw err;
      throw new ApiError(403, 'You do not have permission to delete this message');
    }
  }

  message.isDeleted = true;
  message.deletedBy = userId;
  message.deletedByRole = deletedByRole;
  message.content = deletedByRole === 'self'
    ? 'This message was deleted'
    : 'This message was deleted by an admin';
  await message.save();
  await message.populate('deletedBy', 'name');

  const payload = {
    messageId,
    isDeleted: true,
    deletedByRole,
    deletedByName: deletedByRole !== 'self' ? message.deletedBy?.name : null,
    content: message.content
  };

  try {
    const io = getIO();
    io.to(`channel:${message.channelId}`).emit('chat:message_deleted', payload);
  } catch (err) {}

  return { success: true };
};

const searchMessages = async (channelId, query, userId) => {
  if (!query || query.trim().length < 2) {
    throw new ApiError(400, 'Query must be at least 2 characters');
  }
  const messages = await Message.find({
    channelId,
    $text: { $search: query },
    isDeleted: false
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(20)
  .populate('senderId', 'name avatar')
  .lean();

  return messages;
};

module.exports = { sendMessage, getMessages, markAsRead, editMessage, reactToMessage, deleteMessage, searchMessages };
