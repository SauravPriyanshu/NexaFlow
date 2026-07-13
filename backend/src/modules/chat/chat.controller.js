const chatService = require('./chat.service');
const ApiResponse = require('../../shared/utils/ApiResponse');

const reactMessage = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const reactions = await chatService.reactToMessage(req.params.messageId, req.user._id, emoji);
    res.status(200).json(new ApiResponse(200, reactions, 'Reaction updated'));
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const messageData = { ...req.body, senderId: req.user._id };
    const message = await chatService.sendMessage(messageData);
    res.status(201).json(new ApiResponse(201, message, 'Message sent successfully'));
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const result = await chatService.getMessages(req.params.channelId, req.user._id, { 
      cursor, 
      limit: limit ? parseInt(limit) : 30 
    });
    res.status(200).json(new ApiResponse(200, result, 'Messages retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { channelId } = req.body;
    await chatService.markAsRead(channelId || req.params.messageId, req.user._id); // Assuming body is channelId
    res.status(200).json(new ApiResponse(200, null, 'Messages marked as read'));
  } catch (err) {
    next(err);
  }
};

const editMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const message = await chatService.editMessage(req.params.messageId, req.user._id, content);
    res.status(200).json(new ApiResponse(200, message, 'Message edited successfully'));
  } catch (err) {
    next(err);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    await chatService.deleteMessage(req.params.messageId, req.user._id);
    res.status(200).json(new ApiResponse(200, null, 'Message deleted successfully'));
  } catch (err) {
    next(err);
  }
};

const searchMessages = async (req, res, next) => {
  try {
    const { q } = req.query;
    const messages = await chatService.searchMessages(req.params.channelId, q, req.user._id);
    res.status(200).json(new ApiResponse(200, messages, 'Search complete'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  editMessage,
  reactMessage,
  deleteMessage,
  searchMessages
};
