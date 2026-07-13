const mongoose = require('mongoose');
const Task = require('../task/task.model');
const Project = require('../project/project.model');
const User = require('../user/user.model');
const Org = require('../org/org.model');
const Notification = require('../notification/notification.model');
const ActivityLog = require('../activity/activity.model'); // assuming this exists based on instructions

const { ObjectId } = mongoose.Types;

async function getProjectStats(projectId) {
  const result = await Task.aggregate([
    { $match: { projectId: new ObjectId(projectId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]);

  const stats = { todo: 0, in_progress: 0, review: 0, testing: 0, done: 0, total: 0 };
  result.forEach(item => {
    if (stats[item.status] !== undefined) {
      stats[item.status] = item.count;
    }
    stats.total += item.count;
  });
  
  return stats;
}

async function getTaskCompletionOverTime(projectId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await ActivityLog.aggregate([
    { 
      $match: {
        projectId: new ObjectId(projectId),
        action: 'task.status_changed',
        'metadata.newStatus': 'done',
        createdAt: { $gte: startDate }
      }
    },
    { 
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Generate date labels and fill in missing days
  const labels = [];
  const data = [];
  let total = 0;
  
  const dateMap = new Map();
  result.forEach(item => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
    dateMap.set(key, item.count);
    total += item.count;
  });

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const formattedLabel = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    labels.push(formattedLabel);
    data.push(dateMap.get(key) || 0);
  }

  return { labels, data, total };
}

async function getMemberProductivity(projectId) {
  const result = await Task.aggregate([
    { $match: { projectId: new ObjectId(projectId), status: 'done' } },
    { $unwind: '$assignees' },
    { $group: { _id: '$assignees', tasksCompleted: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { name: '$user.name', avatar: '$user.avatar', tasksCompleted: 1, _id: 0 } },
    { $sort: { tasksCompleted: -1 } },
    { $limit: 10 }
  ]);
  
  return result;
}

async function getOrgOverview(orgId, userId) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const [activeProjects, myPendingTasks, completedThisWeek, unreadNotifications] = await Promise.all([
    Project.countDocuments({ orgId, status: 'active' }),
    Task.countDocuments({ orgId, assignees: userId, status: { $ne: 'done' } }),
    Task.countDocuments({ orgId, assignees: userId, status: 'done', updatedAt: { $gte: sevenDaysAgo } }),
    Notification.countDocuments({ userId, isRead: false })
  ]);

  return { activeProjects, myPendingTasks, completedThisWeek, unreadNotifications };
}

async function getWeeklyProgress(orgId) {
  const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
  
  const result = await Task.aggregate([
    { 
      $match: { 
        orgId: new ObjectId(orgId),
        createdAt: { $gte: eightWeeksAgo } 
      } 
    },
    { 
      $group: {
        _id: { week: { $isoWeek: '$createdAt' }, year: { $isoWeekYear: '$createdAt' } },
        created: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  const labels = [];
  const created = [];
  const completed = [];

  result.forEach(item => {
    labels.push(`Week ${item._id.week}`);
    created.push(item.created);
    completed.push(item.completed);
  });

  return { labels, created, completed };
}

async function getTaskActivity(taskId) {
  const activities = await ActivityLog.find({ entityId: new ObjectId(taskId) })
    .populate('actorId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50);
  return activities;
}

module.exports = {
  getProjectStats,
  getTaskCompletionOverTime,
  getMemberProductivity,
  getOrgOverview,
  getWeeklyProgress,
  getTaskActivity
};
