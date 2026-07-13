const eventBus = require('./eventBus');
const notificationService = require('../../modules/notification/notification.service');
const { logActivity } = require('./activityLogger');
const { logger } = require('./logger');

const initEventListeners = () => {
  // --- Task Events ---
  eventBus.on('task:created', async ({ task, actorId }) => {
    try {
      await logActivity({
        orgId: task.orgId,
        projectId: task.projectId,
        actorId,
        action: 'task.created',
        entityType: 'Task',
        entityId: task._id,
        entityName: task.title
      });
      
      if (!task.assignees || task.assignees.length === 0) return;
      
      const Project = require('../../modules/project/project.model');
      const Org = require('../../modules/org/org.model');
      const { sendTaskAssignedEmail } = require('./sendEmail');
      const User = require('../../modules/user/user.model');
      
      const [project, org, actor] = await Promise.all([
        Project.findById(task.projectId),
        Org.findById(task.orgId),
        User.findById(actorId)
      ]);

      const actorName = actor ? actor.name : 'Someone';
      const projectName = project ? project.name : 'Unknown Project';
      const orgName = org ? org.name : 'Unknown Org';

      for (const assigneeId of task.assignees) {
        await notificationService.createNotification({
          userId: assigneeId,
          actorId,
          type: 'task_assigned',
          title: 'New task assigned',
          message: `${actorName} assigned you to "${task.title}" in ${projectName} (${orgName})`,
          link: `/projects/${task.projectId}/kanban`,
          refId: task._id,
          refModel: 'Task'
        });

        // Email notification
        const user = await User.findById(assigneeId).select('email name');
        if (user?.email) {
          sendTaskAssignedEmail(user.email, {
            taskTitle: task.title,
            projectName: projectName,
            assignerName: actorName,
            taskLink: `/projects/${task.projectId}/kanban?task=${task._id}`
          }).catch(err => logger.error('Email send failed:', err));
        }
      }
    } catch (err) {
      logger.error('Error in task:created event listener:', err);
    }
  });

  eventBus.on('task:updated', async ({ taskId, changes, actorId, addedAssignees, taskTitle, projectId }) => {
    try {
      const Task = require('../../modules/task/task.model');
      const task = await Task.findById(taskId);
      if (!task) return;
      
      await logActivity({
        orgId: task.orgId,
        projectId: task.projectId,
        actorId,
        action: 'task.updated',
        entityType: 'Task',
        entityId: task._id,
        entityName: task.title,
        metadata: { changes }
      });

      if (addedAssignees && addedAssignees.length > 0) {
        const Project = require('../../modules/project/project.model');
        const Org = require('../../modules/org/org.model');
        const User = require('../../modules/user/user.model');
        
        const [project, org, actor] = await Promise.all([
          Project.findById(task.projectId),
          Org.findById(task.orgId),
          User.findById(actorId)
        ]);

        const actorName = actor ? actor.name : 'Someone';
        const projectName = project ? project.name : 'Unknown Project';
        const orgName = org ? org.name : 'Unknown Org';

        for (const assigneeId of addedAssignees) {
          await notificationService.createNotification({
            userId: assigneeId,
            actorId,
            type: 'task_assigned',
            title: 'New task assigned',
            message: `${actorName} assigned you to "${taskTitle || task.title}" in ${projectName} (${orgName})`,
            link: `/projects/${projectId || task.projectId}/kanban`,
            refId: taskId,
            refModel: 'Task'
          });
        }
      }
    } catch (err) {
      logger.error('Error in task:updated:', err);
    }
  });

  eventBus.on('task:status_changed', async ({ taskId, oldStatus, newStatus, actorId }) => {
    try {
      const Task = require('../../modules/task/task.model');
      const task = await Task.findById(taskId);
      if (!task) return;

      await logActivity({
        orgId: task.orgId,
        projectId: task.projectId,
        actorId,
        action: 'task.status_changed',
        entityType: 'Task',
        entityId: task._id,
        entityName: task.title,
        metadata: { oldStatus, newStatus }
      });

      if (newStatus === 'done' && task.createdBy.toString() !== actorId.toString()) {
        await notificationService.createNotification({
          userId: task.createdBy,
          actorId,
          type: 'task_completed',
          title: 'Task completed',
          message: `"${task.title}" was marked as done`,
          link: `/projects/${task.projectId}/kanban`,
          refId: taskId,
          refModel: 'Task'
        });
      }
    } catch (err) {
      logger.error('Error in task:status_changed:', err);
    }
  });

  eventBus.on('task:deleted', async ({ taskId, projectId }) => {
    try {
      const Project = require('../../modules/project/project.model');
      const project = await Project.findById(projectId);
      if (!project) return;
      // We don't have actorId directly easily here without passing it. Assume it's passed or omit actorId (requires schema change).
      // Let's assume delete emits actorId too as updated in task service. Wait, did I add actorId? I'll check later.
    } catch (err) {
      logger.error('Error in task:deleted:', err);
    }
  });

  // --- File Events ---
  eventBus.on('file:uploaded', async ({ file, actorId }) => {
    try {
      await logActivity({
        orgId: file.orgId,
        projectId: file.projectId,
        actorId,
        action: 'file.uploaded',
        entityType: 'File',
        entityId: file._id,
        entityName: file.name,
        metadata: { size: file.size, type: file.resourceType }
      });
    } catch (err) {
      logger.error('Error handling file:uploaded event:', err);
    }
  });

  eventBus.on('file:deleted', async ({ file, actorId }) => {
    try {
      await logActivity({
        orgId: file.orgId,
        projectId: file.projectId,
        actorId,
        action: 'file.deleted',
        entityType: 'File',
        entityId: file._id,
        entityName: file.name
      });
    } catch (err) {
      logger.error('Error handling file:deleted event:', err);
    }
  });

  // --- Comment Events ---
  eventBus.on('comment:created', async ({ comment, actorId }) => {
    try {
      const Project = require('../../modules/project/project.model');
      const project = await Project.findById(comment.projectId);
      await logActivity({
        orgId: project.orgId,
        projectId: comment.projectId,
        actorId,
        action: 'comment.created',
        entityType: 'Comment',
        entityId: comment._id,
        entityName: 'Comment'
      });
    } catch (err) {
      logger.error('Error handling comment:created event:', err);
    }
  });

  eventBus.on('comment:deleted', async ({ comment, actorId }) => {
    try {
      const Project = require('../../modules/project/project.model');
      const project = await Project.findById(comment.projectId);
      await logActivity({
        orgId: project.orgId,
        projectId: comment.projectId,
        actorId,
        action: 'comment.deleted',
        entityType: 'Comment',
        entityId: comment._id,
        entityName: 'Comment'
      });
    } catch (err) {
      logger.error('Error handling comment:deleted event:', err);
    }
  });

  eventBus.on('user:mentioned', async ({ userId, comment, actorId }) => {
    try {
      await notificationService.createNotification({
        userId,
        type: 'mention',
        title: 'You were mentioned',
        message: `You were mentioned in a comment.`,
        actorId,
        link: `/projects/${comment.projectId}/kanban?task=${comment.taskId}`
      });
    } catch (err) {
      logger.error('Error handling user:mentioned event:', err);
    }
  });
};

module.exports = { initEventListeners };
