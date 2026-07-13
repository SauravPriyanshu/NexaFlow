const Task = require('../task/task.model');
const Project = require('../project/project.model');
const User = require('../user/user.model');
const Org = require('../org/org.model');
const File = require('../file/file.model');
const ApiError = require('../../shared/utils/ApiError');

async function globalSearch(query, userId, orgId, filters) {
  if (!query || query.trim().length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters');
  }

  const q = query.trim();
  const limit = Math.min(filters.limit || 5, 20);
  const types = filters.types || ['task', 'project', 'user', 'file'];

  // Get user's accessible project IDs (for scoping results)
  const userProjects = await Project.find(
    { 'members.userId': userId, orgId },
    { _id: 1 }
  ).lean();
  const projectIds = userProjects.map(p => p._id);

  const results = {};
  const searches = [];

  if (types.includes('task')) {
    searches.push(
      Task.find({
        $text: { $search: q },
        projectId: { $in: projectIds }
      })
      .select('title description status priority projectId dueDate assignees')
      .populate('projectId', 'name color')
      .populate('assignees', 'name avatar')
      .limit(limit)
      .lean()
      .then(tasks => { results.tasks = tasks; })
    );
  }

  if (types.includes('project')) {
    searches.push(
      Project.find({
        $text: { $search: q },
        orgId,
        'members.userId': userId
      })
      .select('name description status color members createdAt')
      .limit(limit)
      .lean()
      .then(projects => { results.projects = projects; })
    );
  }

  if (types.includes('user')) {
    const org = await Org.findById(orgId).select('members').lean();
    const memberIds = org?.members.map(m => m.userId) || [];
    searches.push(
      User.find({
        $text: { $search: q },
        _id: { $in: memberIds }
      })
      .select('name email avatar bio skills')
      .limit(limit)
      .lean()
      .then(users => { results.users = users; })
    );
  }

  if (types.includes('file')) {
    searches.push(
      File.find({
        $text: { $search: q },
        projectId: { $in: projectIds },
        isDeleted: false
      })
      .select('name cloudinaryUrl mimeType size projectId uploadedBy createdAt')
      .populate('projectId', 'name color')
      .populate('uploadedBy', 'name avatar')
      .limit(limit)
      .lean()
      .then(files => { results.files = files; })
    );
  }

  await Promise.all(searches);

  return {
    query: q,
    results,
    totalCount: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
  };
}

module.exports = { globalSearch };
