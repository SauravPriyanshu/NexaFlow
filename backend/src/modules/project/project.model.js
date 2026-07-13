const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
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
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['manager', 'developer', 'viewer'],
          default: 'developer',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    color: {
      type: String,
      default: '#06b6d4',
    },
    icon: {
      type: String,
      default: 'folder',
    },
    isFavorited: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
    taskStatuses: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          color: { type: String, required: true },
          order: { type: Number, default: 0 }
        }
      ],
      default: [
        { id: 'todo', title: 'Todo', color: 'var(--status-todo)', order: 1000 },
        { id: 'in_progress', title: 'In Progress', color: 'var(--status-in-progress)', order: 2000 },
        { id: 'review', title: 'Review', color: 'var(--status-review)', order: 3000 },
        { id: 'testing', title: 'Testing', color: 'var(--status-testing)', order: 4000 },
        { id: 'done', title: 'Done', color: 'var(--status-done)', order: 5000 }
      ]
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ orgId: 1, status: 1 });
projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ createdBy: 1 });

projectSchema.index(
  { name: 'text', description: 'text' },
  { weights: { name: 10, description: 1 }, name: 'project_text_index' }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
