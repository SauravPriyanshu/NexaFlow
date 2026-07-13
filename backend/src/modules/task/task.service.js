const Task = require('./task.model');
const Project = require('../project/project.model');
const ApiError = require('../../shared/utils/ApiError');
const eventBus = require('../../shared/utils/eventBus');
const { getIO } = require('../../shared/socket/socket');
const { logActivity } = require('../activity/activity.service');
const { sanitizeHtml } = require('../../shared/utils/sanitize');

const createTask = async ({ title, description, projectId, orgId, createdBy, assignees, priority, labels, dueDate, estimatedHours }) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const isMember = project.members.some(m => m.userId.toString() === createdBy.toString());
  if (!isMember) {
    throw new ApiError(403, 'You must be a member of the project to create tasks');
  }

  const lastTask = await Task.findOne({ projectId, status: 'todo' }).sort({ order: -1 });
  const maxOrder = lastTask ? lastTask.order : 0;
  const order = maxOrder + 1000;

  const task = new Task({
    title,
    description: sanitizeHtml(description),
    projectId,
    orgId,
    createdBy,
    assignees: assignees || [],
    status: 'todo',
    priority,
    labels: labels || [],
    dueDate,
    estimatedHours,
    order,
    checklists: []
  });

  await task.save();
  await task.populate('assignees', 'name email avatar');

  eventBus.emit('task:created', { task, actorId: createdBy });

  try {
    const io = getIO();
    io.to(`project:${task.projectId}`).emit('task:created', task);
  } catch (err) {}

  await logActivity({
    orgId: task.orgId,
    projectId: task.projectId,
    actorId: createdBy,
    action: 'create_task',
    entityType: 'task',
    entityId: task._id,
    entityName: task.title,
    metadata: { status: 'todo' }
  });

  return task;
};

const getMyTasks = async (userId) => {
  return await Task.find({ assignees: userId })
    .populate('projectId', 'name color')
    .sort({ dueDate: 1 })
    .lean();
};

const getTasksByProject = async (projectId, userId, filters = {}) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const isMember = project.members.some(m => m.userId.toString() === userId.toString());
  if (!isMember) {
    throw new ApiError(403, 'You must be a member of the project to view tasks');
  }

  const query = { projectId };
  
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.assignee) query.assignees = filters.assignee;
  if (filters.label) query.labels = filters.label;
  if (filters.dueBefore) query.dueDate = { $lte: new Date(filters.dueBefore) };
  if (filters.dueAfter) query.dueDate = { ...query.dueDate, $gte: new Date(filters.dueAfter) };

  const tasks = await Task.find(query)
    .populate('assignees', 'name email avatar')
    .sort({ order: 1 })
    .lean();

  const groupedTasks = {};
  const statuses = project.taskStatuses || [
    { id: 'todo' }, { id: 'in_progress' }, { id: 'review' }, { id: 'testing' }, { id: 'done' }
  ];

  statuses.forEach(status => {
    groupedTasks[status.id] = [];
  });

  const defaultStatusId = statuses.length > 0 ? statuses[0].id : 'todo';

  tasks.forEach(task => {
    const statusId = task.status;
    if (groupedTasks[statusId]) {
      groupedTasks[statusId].push(task);
    } else {
      if (groupedTasks[defaultStatusId]) {
        groupedTasks[defaultStatusId].push(task);
      }
    }
  });

  return groupedTasks;
};

const getTaskById = async (taskId, userId) => {
  const task = await Task.findById(taskId)
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('projectId', 'name color')
    .lean();

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const project = await Project.findById(task.projectId);
  const isMember = project && project.members.some(m => m.userId.toString() === userId.toString());
  if (!isMember) {
    throw new ApiError(403, 'You do not have access to this task');
  }

  return task;
};

const updateTask = async (taskId, userId, updates) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const project = await Project.findById(task.projectId);
  const isMember = project && project.members.some(m => m.userId.toString() === userId.toString());
  if (!isMember) {
    throw new ApiError(403, 'You do not have access to update this task');
  }

  if (updates.status) {
    throw new ApiError(400, 'Status changes must be made through the status update endpoint');
  }

  const allowedFields = ['title', 'description', 'assignees', 'priority', 'labels', 'dueDate', 'estimatedHours', 'checklists'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateData[field] = field === 'description' ? sanitizeHtml(updates[field]) : updates[field];
    }
  });

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    updateData,
    { new: true, runValidators: true }
  ).populate('assignees', 'name email avatar');

  // Compute newly added assignees for notifications
  let addedAssignees = [];
  if (updateData.assignees) {
    const oldAssignees = task.assignees.map(a => a.toString());
    const newAssignees = updatedTask.assignees.map(a => a._id.toString());
    addedAssignees = newAssignees.filter(id => !oldAssignees.includes(id));
  }

  // Pass updatedTask as changes so the frontend gets populated fields
  eventBus.emit('task:updated', { taskId, changes: updatedTask, actorId: userId, addedAssignees, taskTitle: updatedTask.title, projectId: updatedTask.projectId });

  try {
    const io = getIO();
    io.to(`project:${task.projectId}`).emit('task:updated', { taskId, changes: updatedTask });
  } catch (err) {}

  await logActivity({
    orgId: task.orgId,
    projectId: task.projectId,
    actorId: userId,
    action: 'update_task',
    entityType: 'task',
    entityId: task._id,
    entityName: task.title,
    metadata: { changes: Object.keys(updateData) }
  });

  return updatedTask;
};

const updateTaskStatus = async (taskId, userId, { status, order }) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const project = await Project.findById(task.projectId);
  const isMember = project && project.members.some(m => m.userId.toString() === userId.toString());
  if (!isMember) {
    throw new ApiError(403, 'You do not have access to update this task');
  }

  const oldStatus = task.status;
  task.status = status || task.status;
  if (order !== undefined) {
    task.order = order;
  }

  await task.save();
  
  eventBus.emit('task:status_changed', { taskId, oldStatus, newStatus: task.status, actorId: userId });

  try {
    const io = getIO();
    io.to(`project:${task.projectId}`).emit('task:status_changed', { taskId, oldStatus, newStatus: task.status, order: task.order });
  } catch (err) {}

  if (oldStatus !== task.status) {
    await logActivity({
      orgId: task.orgId,
      projectId: task.projectId,
      actorId: userId,
      action: 'update_status',
      entityType: 'task',
      entityId: task._id,
      entityName: task.title,
      metadata: { oldStatus, newStatus: task.status }
    });

    if (task.status === 'done') {
      try {
        const io = getIO();
        io.to(`org:${task.orgId}`).emit('stats:task_completed', { taskId: task._id });
      } catch (err) {}
    }
  }

  return task.populate('assignees', 'name email avatar');
};

const reorderTasks = async (projectId, userId, tasksUpdate) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const isMember = project.members.some(m => m.userId.toString() === userId.toString());
  if (!isMember) {
    throw new ApiError(403, 'You do not have access to update tasks in this project');
  }

  const bulkOps = tasksUpdate.map(t => ({
    updateOne: {
      filter: { _id: t._id, projectId },
      update: { $set: { status: t.status, order: t.order } }
    }
  }));

  if (bulkOps.length > 0) {
    await Task.bulkWrite(bulkOps);
  }

  return { updated: true };
};

const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const project = await Project.findById(task.projectId);
  const isCreator = task.createdBy.toString() === userId.toString();
  const isManager = project && project.members.some(m => m.userId.toString() === userId.toString() && m.role === 'manager');

  if (!isCreator && !isManager) {
    throw new ApiError(403, 'Only the task creator or project manager can delete this task');
  }

  await Task.findByIdAndDelete(taskId);
  
  eventBus.emit('task:deleted', { taskId, projectId: task.projectId });

  return { deleted: true };
};

const updateChecklist = async (taskId, userId, { checklistId, done }) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const project = await Project.findById(task.projectId);
  const isMember = project && project.members.some(m => m.userId.toString() === userId.toString());
  if (!isMember) {
    throw new ApiError(403, 'You do not have access to update this task');
  }

  const checklistItem = task.checklists.find(c => c.id === checklistId);
  if (!checklistItem) {
    throw new ApiError(404, 'Checklist item not found');
  }

  checklistItem.done = done;
  await task.save();

  return task.populate('assignees', 'name email avatar');
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
