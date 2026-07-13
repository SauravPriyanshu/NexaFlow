const express = require('express');
const authenticate = require('../../shared/middleware/authenticate');
const { uploadSingle } = require('../../shared/middleware/upload');
const fileController = require('./file.controller');

const router = express.Router();

router.use(authenticate);

router.post('/upload/:projectId', uploadSingle, fileController.uploadFile);
router.get('/project/:projectId', fileController.getFilesByProject);
router.get('/task/:taskId', fileController.getFilesByTask);
router.patch('/:fileId/rename', fileController.renameFile);
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
