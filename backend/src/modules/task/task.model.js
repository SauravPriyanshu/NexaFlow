const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      maxlength: 5000,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    labels: [
      {
        type: String,
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    estimatedHours: {
      type: Number,
      default: null,
    },
    checklists: [
      {
        _id: false,
        id: {
          type: String,
        },
        text: {
          type: String,
        },
        done: {
          type: Boolean,
          default: false,
        },
      },
    ],
    attachmentCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ projectId: 1, status: 1, order: 1 });
taskSchema.index({ projectId: 1, dueDate: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ orgId: 1, status: 1 });

taskSchema.index(
  { title: 'text', description: 'text', labels: 'text' },
  { weights: { title: 10, labels: 5, description: 1 }, name: 'task_text_index' }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
