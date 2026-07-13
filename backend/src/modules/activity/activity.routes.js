const express = require('express');
const authenticate = require('../../shared/middleware/authenticate');
const activityController = require('./activity.controller');

const router = express.Router();

router.use(authenticate);

router.get('/project/:projectId', activityController.getProjectActivity);
router.get('/org/:orgId', activityController.getOrgActivity);
router.get('/task/:taskId', activityController.getTaskActivity);

module.exports = router;
