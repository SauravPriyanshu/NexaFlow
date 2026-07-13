const ActivityLog = require('./activity.model');
const catchAsync = require('../../shared/utils/catchAsync');
const Project = require('../project/project.model');
const ApiError = require('../../shared/utils/ApiError');

const getProjectActivity = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const isMember = project.members.some(m => m.userId.toString() === req.user._id.toString());
  if (!isMember) throw new ApiError(403, 'You do not have access to this project\'s activity');

  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    ActivityLog.find({ projectId })
      .populate('actorId', 'name avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ActivityLog.countDocuments({ projectId })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

const getOrgActivity = catchAsync(async (req, res) => {
  const { orgId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Assuming user is authenticated and we might check org membership here.
  // For brevity, similar logic to project check:
  
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    ActivityLog.find({ orgId })
      .populate('actorId', 'name avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ActivityLog.countDocuments({ orgId })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

const getTaskActivity = catchAsync(async (req, res) => {
  const { taskId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const skip = (page - 1) * limit;

  // We find activities where entityId is the task, OR metadata.taskId is the task
  const query = {
    $or: [
      { entityId: taskId },
      { 'metadata.taskId': taskId }
    ]
  };

  const [activities, total] = await Promise.all([
    ActivityLog.find(query)
      .populate('actorId', 'name avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ActivityLog.countDocuments(query)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

module.exports = {
  getProjectActivity,
  getOrgActivity,
  getTaskActivity
};
