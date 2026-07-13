const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'task.created', 'task.updated', 'task.deleted', 'task.status_changed',
      'task.assigned', 'task.commented',
      'project.created', 'project.updated', 'project.archived',
      'file.uploaded', 'file.deleted',
      'member.invited', 'member.removed',
      'comment.created', 'comment.deleted'
    ]
  },
  entityType: {
    type: String,
    enum: ['Task', 'Project', 'File', 'Comment', 'Member']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  entityName: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ orgId: 1, createdAt: -1 });
activityLogSchema.index({ actorId: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
