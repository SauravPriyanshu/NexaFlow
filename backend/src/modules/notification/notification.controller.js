const notificationService = require('./notification.service');
const ApiResponse = require('../../shared/utils/ApiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await notificationService.getNotifications(req.user._id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20
    });
    res.status(200).json(new ApiResponse(200, result, 'Notifications retrieved'));
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Unread count retrieved'));
  } catch (err) {
    next(err);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markNotificationRead(req.params.notificationId, req.user._id);
    res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user._id);
    res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead
};
