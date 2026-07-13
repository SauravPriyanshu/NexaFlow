const Notification = require('./notification.model');
const { getIO } = require('../../shared/socket/socket');
const { getCache, setCache, deleteCache, TTL_SHORT } = require('../../shared/utils/cache');
const CACHE_KEYS = require('../../shared/utils/cacheKeys');

const createNotification = async ({ userId, actorId, type, title, message, link, refId, refModel }) => {
  const notification = new Notification({
    userId,
    actorId,
    type,
    title,
    message,
    link,
    refId,
    refModel
  });

  await notification.save();
  await notification.populate('actorId', 'name avatar');

  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:new', notification);
    io.to(`user:${userId}`).emit('stats:notif_count_changed');
  } catch (err) {}

  await deleteCache(CACHE_KEYS.userNotifCount(userId));
  return notification;
};

const getNotifications = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('actorId', 'name avatar');

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  const total = await Notification.countDocuments({ userId });

  return {
    notifications,
    unreadCount,
    totalPages: Math.ceil(total / limit)
  };
};

const markNotificationRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  await deleteCache(CACHE_KEYS.userNotifCount(userId));
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('stats:notif_count_changed');
  } catch (err) {}
  return notification;
};

const markAllRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  await deleteCache(CACHE_KEYS.userNotifCount(userId));
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('stats:notif_count_changed');
  } catch (err) {}
  return { success: true };
};

const getUnreadCount = async (userId) => {
  const cacheKey = CACHE_KEYS.userNotifCount(userId);
  let countObj = await getCache(cacheKey);

  if (!countObj) {
    const count = await Notification.countDocuments({ userId, isRead: false });
    countObj = { unreadCount: count };
    await setCache(cacheKey, countObj, TTL_SHORT);
  }

  return countObj;
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllRead,
  getUnreadCount
};
