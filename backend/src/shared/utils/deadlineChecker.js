const Task = require('../../modules/task/task.model');
const { createNotification } = require('../../modules/notification/notification.service');
const { sendTaskDueSoonEmail } = require('./sendEmail');

async function checkDeadlines() {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);

    // Tasks due in next 24 hours that aren't done
    const dueTasks = await Task.find({
      dueDate: { $gte: now, $lte: in24h },
      status: { $ne: 'done' },
      assignees: { $exists: true, $ne: [] }
    }).populate('assignees', '_id email name');

    for (const task of dueTasks) {
      for (const assignee of task.assignees) {
        // In-app notification
        await createNotification({
          userId: assignee._id,
          actorId: null,
          type: 'task_due_soon',
          title: 'Task due soon',
          message: `"${task.title}" is due ${task.dueDate < in1h ? 'in less than 1 hour' : 'in 24 hours'}`,
          link: `/projects/${task.projectId}/kanban`,
          refId: task._id,
          refModel: 'Task'
        });

        // Email notification
        if (assignee.email) {
          // sendTaskDueSoonEmail will be added in FIX 4, this is safe because JS function calls fail gracefully with the catch block, but wait, it will throw a TypeError if sendTaskDueSoonEmail is undefined.
          if (typeof sendTaskDueSoonEmail === 'function') {
            await sendTaskDueSoonEmail(assignee.email, {
              taskTitle: task.title,
              dueDate: task.dueDate,
              taskLink: `/projects/${task.projectId}/kanban?task=${task._id}`
            }).catch(err => console.error('Failed to send due soon email:', err));
          }
        }
      }
    }
  } catch (err) {
    console.error('Error in deadlineChecker:', err);
  }
}

module.exports = { checkDeadlines };
