const taskService = require('./task.service');
const ApiResponse = require('../../shared/utils/ApiResponse');

const createTask = async (req, res, next) => {
  try {
    const taskData = { ...req.body, createdBy: req.user._id };
    const task = await taskService.createTask(taskData);
    res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
  } catch (err) {
    next(err);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getMyTasks(req.user._id);
    res.status(200).json(new ApiResponse(200, tasks, 'My tasks retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksByProject(req.params.projectId, req.user._id, req.query);
    res.status(200).json(new ApiResponse(200, tasks, 'Tasks retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId, req.user._id);
    res.status(200).json(new ApiResponse(200, task, 'Task retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.taskId, req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, task, 'Task updated successfully'));
  } catch (err) {
    next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus(req.params.taskId, req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, task, 'Task status updated successfully'));
  } catch (err) {
    next(err);
  }
};

const reorderTasks = async (req, res, next) => {
  try {
    const result = await taskService.reorderTasks(req.params.projectId, req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, result, 'Tasks reordered successfully'));
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.taskId, req.user._id);
    res.status(200).json(new ApiResponse(200, null, 'Task deleted successfully'));
  } catch (err) {
    next(err);
  }
};

const updateChecklist = async (req, res, next) => {
  try {
    const task = await taskService.updateChecklist(req.params.taskId, req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, task, 'Checklist updated successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  updateTaskStatus,
  reorderTasks,
  deleteTask,
  updateChecklist,
  getMyTasks
};
