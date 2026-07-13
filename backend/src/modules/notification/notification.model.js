const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'task_assigned', 'task_completed', 'task_commented',
        'project_invited', 'org_invited', 'mention',
        'file_uploaded', 'task_due_soon'
      ]
    },
    title: String,
    message: String,
    link: String,
    isRead: {
      type: Boolean,
      default: false
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId
    },
    refModel: {
      type: String,
      enum: ['Task', 'Project', 'File']
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
