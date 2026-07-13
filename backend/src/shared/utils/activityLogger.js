const ActivityLog = require('../../modules/activity/activity.model');
const { getIO } = require('../socket/socket');

const logActivity = async ({ orgId, projectId, actorId, action, entityType, entityId, entityName, metadata }) => {
  try {
    const log = new ActivityLog({
      orgId,
      projectId,
      actorId,
      action,
      entityType,
      entityId,
      entityName,
      metadata: metadata || {}
    });

    await log.save();
    
    // Populate actor info for real-time emission
    await log.populate('actorId', 'name avatar');

    const io = getIO();
    if (projectId) {
      io.to(`project:${projectId}`).emit('activity:new', log);
    }
    if (orgId && !projectId) {
      io.to(`org:${orgId}`).emit('activity:new', log);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
