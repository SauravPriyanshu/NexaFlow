const ActivityLog = require('./activity.model');
const { getIO } = require('../../shared/socket/socket');

const logActivity = async ({ orgId, projectId, actorId, action, entityType, entityId, entityName, metadata }) => {
  try {
    const activity = new ActivityLog({
      orgId,
      projectId,
      actorId,
      action,
      entityType,
      entityId,
      entityName,
      metadata
    });

    await activity.save();
    await activity.populate('actorId', 'name avatar email');

    const io = getIO();
    if (io) {
      if (projectId) {
        io.to(`project:${projectId}`).emit('activity:new', activity);
      } else if (orgId) {
        io.to(`org:${orgId}`).emit('activity:new', activity);
      }
    }

    return activity;
  } catch (err) {
    console.error('Failed to log activity:', err);
    // Don't throw, activity logging should not break the main flow
  }
};

module.exports = {
  logActivity
};
