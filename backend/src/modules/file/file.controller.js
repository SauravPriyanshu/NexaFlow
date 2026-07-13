const fileService = require('./file.service');
const catchAsync = require('../../shared/utils/catchAsync');

const uploadFile = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file provided' });
  }

  const { projectId } = req.params;
  // We need orgId. In a real scenario we could get it from the project or request body.
  // Assuming it might be passed in body or we can fetch project.
  const Project = require('../project/project.model');
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ status: 'error', message: 'Project not found' });
  }

  const file = await fileService.uploadFile({
    file: req.file,
    projectId,
    orgId: project.orgId,
    uploadedBy: req.user._id,
    taskId: req.body.taskId,
    customName: req.body.customName
  });

  res.status(201).json({
    status: 'success',
    data: { file }
  });
});

const getFilesByProject = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const { folder, page, limit } = req.query;

  const result = await fileService.getFilesByProject(projectId, req.user._id, { folder, page, limit });

  res.status(200).json({
    status: 'success',
    data: result
  });
});

const getFilesByTask = catchAsync(async (req, res) => {
  const { taskId } = req.params;

  const files = await fileService.getFilesByTask(taskId, req.user._id);

  res.status(200).json({
    status: 'success',
    data: { files }
  });
});

const deleteFile = catchAsync(async (req, res) => {
  const { fileId } = req.params;

  await fileService.deleteFile(fileId, req.user._id);

  res.status(200).json({
    status: 'success',
    data: null
  });
});

const renameFile = catchAsync(async (req, res) => {
  const { fileId } = req.params;
  const { newName } = req.body;

  if (!newName) {
    return res.status(400).json({ status: 'error', message: 'New name is required' });
  }

  const file = await fileService.renameFile(fileId, req.user._id, newName);

  res.status(200).json({
    status: 'success',
    data: { file }
  });
});

module.exports = {
  uploadFile,
  getFilesByProject,
  getFilesByTask,
  deleteFile,
  renameFile
};
