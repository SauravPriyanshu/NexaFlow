const File = require('./file.model');
const Project = require('../project/project.model');
const Task = require('../task/task.model');
const ApiError = require('../../shared/utils/ApiError');
const eventBus = require('../../shared/utils/eventBus');
const cloudinary = require('../../config/cloudinary');

const uploadFile = async ({ file, projectId, orgId, uploadedBy, taskId, customName }) => {
  const fileDoc = new File({
    name: customName || file.originalname,
    cloudinaryUrl: `/uploads/${file.filename}`,
    cloudinaryPublicId: file.filename, // keep for compat
    projectId,
    orgId,
    uploadedBy,
    taskId: taskId || null,
    mimeType: file.mimetype,
    size: file.size,
    resourceType: file.resource_type || 'auto',
    // Cloudinary can sometimes return a thumbnail/preview url, if not we'll just store null or the original for now
    thumbnailUrl: null
  });

  await fileDoc.save();
  await fileDoc.populate('uploadedBy', 'name avatar email');

  if (taskId) {
    await Task.findByIdAndUpdate(taskId, { $inc: { attachmentCount: 1 } });
  }

  eventBus.emit('file:uploaded', { file: fileDoc, actorId: uploadedBy });

  return fileDoc;
};

const getFilesByProject = async (projectId, userId, { folder = 'root', page = 1, limit = 50 }) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const isMember = project.members.some(m => m.userId.toString() === userId.toString());
  if (!isMember) throw new ApiError(403, 'You must be a member of the project to view files');

  const skip = (page - 1) * limit;

  const query = { projectId, isDeleted: false, folderId: folder };

  const [files, total] = await Promise.all([
    File.find(query)
      .populate('uploadedBy', 'name avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    File.countDocuments(query)
  ]);

  return {
    files,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getFilesByTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const project = await Project.findById(task.projectId);
  const isMember = project && project.members.some(m => m.userId.toString() === userId.toString());
  if (!isMember) throw new ApiError(403, 'You do not have access to these files');

  const files = await File.find({ taskId, isDeleted: false })
    .populate('uploadedBy', 'name avatar email')
    .sort({ createdAt: -1 });

  return files;
};

const deleteFile = async (fileId, userId) => {
  const file = await File.findById(fileId);
  if (!file || file.isDeleted) throw new ApiError(404, 'File not found');

  const project = await Project.findById(file.projectId);
  const isManager = project && project.members.some(m => m.userId.toString() === userId.toString() && m.role === 'manager');
  const isUploader = file.uploadedBy.toString() === userId.toString();

  if (!isUploader && !isManager) {
    throw new ApiError(403, 'Only the uploader or a project manager can delete this file');
  }

  // Skip Cloudinary deletion, local file deletion can be added here if needed
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../../uploads', file.cloudinaryPublicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Local deletion failed', err);
  }

  file.isDeleted = true;
  await file.save();

  if (file.taskId) {
    await Task.findByIdAndUpdate(file.taskId, { $inc: { attachmentCount: -1 } });
  }

  eventBus.emit('file:deleted', { file, actorId: userId });

  return { deleted: true };
};

const renameFile = async (fileId, userId, newName) => {
  const file = await File.findById(fileId);
  if (!file || file.isDeleted) throw new ApiError(404, 'File not found');

  if (file.uploadedBy.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only the uploader can rename this file');
  }

  file.name = newName;
  await file.save();

  return file.populate('uploadedBy', 'name avatar email');
};

module.exports = {
  uploadFile,
  getFilesByProject,
  getFilesByTask,
  deleteFile,
  renameFile
};
