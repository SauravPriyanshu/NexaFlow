const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  mimeType: {
    type: String
  },
  size: {
    type: Number
  },
  resourceType: {
    type: String,
    enum: ['image', 'video', 'raw', 'auto'],
    default: 'auto'
  },
  folderId: {
    type: String,
    default: 'root'
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

fileSchema.index({ projectId: 1, isDeleted: 1, createdAt: -1 });
fileSchema.index({ taskId: 1 });
fileSchema.index({ uploadedBy: 1 });

fileSchema.index(
  { name: 'text' },
  { name: 'file_text_index' }
);

const File = mongoose.model('File', fileSchema);

module.exports = File;
