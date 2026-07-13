const analyticsService = require('./analytics.service');
const ApiResponse = require('../../shared/utils/ApiResponse');

async function getOrgOverview(req, res, next) {
  try {
    const { orgId } = req.params;
    const data = await analyticsService.getOrgOverview(orgId, req.user._id);
    res.json(new ApiResponse(200, data, 'Org overview fetched'));
  } catch (err) {
    next(err);
  }
}

async function getProjectStats(req, res, next) {
  try {
    const { projectId } = req.params;
    const data = await analyticsService.getProjectStats(projectId);
    res.json(new ApiResponse(200, data, 'Project stats fetched'));
  } catch (err) {
    next(err);
  }
}

async function getTaskCompletionOverTime(req, res, next) {
  try {
    const { projectId } = req.params;
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsService.getTaskCompletionOverTime(projectId, days);
    res.json(new ApiResponse(200, data, 'Task completion fetched'));
  } catch (err) {
    next(err);
  }
}

async function getMemberProductivity(req, res, next) {
  try {
    const { projectId } = req.params;
    const data = await analyticsService.getMemberProductivity(projectId);
    res.json(new ApiResponse(200, data, 'Member productivity fetched'));
  } catch (err) {
    next(err);
  }
}

async function getWeeklyProgress(req, res, next) {
  try {
    const { orgId } = req.params;
    const data = await analyticsService.getWeeklyProgress(orgId);
    res.json(new ApiResponse(200, data, 'Weekly progress fetched'));
  } catch (err) {
    next(err);
  }
}

async function getTaskActivity(req, res, next) {
  try {
    const { taskId } = req.params;
    const data = await analyticsService.getTaskActivity(taskId);
    res.json(new ApiResponse(200, data, 'Task activity fetched'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOrgOverview,
  getProjectStats,
  getTaskCompletionOverTime,
  getMemberProductivity,
  getWeeklyProgress,
  getTaskActivity
};
