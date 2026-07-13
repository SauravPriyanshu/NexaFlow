const Project = require('./project.model');
const Org = require('../org/org.model');
const User = require('../user/user.model');
const ApiError = require('../../shared/utils/ApiError');
const { getCache, setCache, deleteCache, TTL_MEDIUM } = require('../../shared/utils/cache');
const CACHE_KEYS = require('../../shared/utils/cacheKeys');

const createProject = async ({ name, description, orgId, createdBy, color, icon, dueDate }) => {
  // Verify org exists
  const org = await Org.findById(orgId);
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }

  // Verify createdBy is a member of the org
  const isMember = org.members.some(member => member.userId.toString() === createdBy.toString());
  if (!isMember) {
    throw new ApiError(403, 'You must be a member of the organization to create a project');
  }

  const project = new Project({
    name,
    description,
    orgId,
    createdBy,
    color,
    icon,
    dueDate,
    members: [{
      userId: createdBy,
      role: 'manager'
    }]
  });

  await project.save();
  return project.populate('members.userId', 'name email avatar');
};

const getProjectsByOrg = async (orgId, userId) => {
  const projects = await Project.find({
    orgId,
    'members.userId': userId
  })
    .populate('members.userId', 'name email avatar')
    .sort({ updatedAt: -1 })
    .lean();

  if (projects.length === 0) return [];

  const Task = require('../task/task.model');
  const projectIds = projects.map(p => p._id);
  
  const taskStats = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    {
      $group: {
        _id: '$projectId',
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
      }
    }
  ]);

  const statsMap = taskStats.reduce((acc, stat) => {
    acc[stat._id.toString()] = stat;
    return acc;
  }, {});

  projects.forEach(p => {
    p.stats = statsMap[p._id.toString()] || { totalTasks: 0, completedTasks: 0 };
  });

  return projects;
};

const getProjectById = async (projectId, userId) => {
  const cacheKey = CACHE_KEYS.projectById(projectId);
  let project = await getCache(cacheKey);

  if (!project) {
    project = await Project.findById(projectId)
      .populate('members.userId', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    await setCache(cacheKey, project, TTL_MEDIUM);
  }

  const isMember = project.members.some(m => m.userId._id.toString() === userId.toString() || m.userId.toString() === userId.toString());
  if (!isMember) {
    throw new ApiError(403, 'You do not have access to this project');
  }

  return project;
};

const updateProject = async (projectId, userId, updates) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const isProjectManager = project.members.some(
    m => m.userId.toString() === userId.toString() && m.role === 'manager'
  );

  // Also verify org admin/owner
  const org = await Org.findById(project.orgId);
  const isOrgAdmin = org && org.members.some(
    m => m.userId.toString() === userId.toString() && ['owner', 'admin'].includes(m.role)
  );

  if (!isProjectManager && !isOrgAdmin) {
    throw new ApiError(403, 'You do not have permission to update this project');
  }

  const allowedFields = ['name', 'description', 'status', 'color', 'icon', 'dueDate'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    updateData,
    { new: true, runValidators: true }
  ).populate('members.userId', 'name email avatar');

  await deleteCache(CACHE_KEYS.projectById(projectId));
  return updatedProject;
};

const deleteProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const org = await Org.findById(project.orgId);
  const isOrgOwner = org && org.ownerId.toString() === userId.toString();
  const isCreator = project.createdBy.toString() === userId.toString();

  if (!isOrgOwner && !isCreator) {
    throw new ApiError(403, 'Only the organization owner or project creator can delete this project');
  }

  await Project.findByIdAndDelete(projectId);
  await deleteCache(CACHE_KEYS.projectById(projectId));
  return { deleted: true };
};

const toggleFavorite = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const index = project.isFavorited.indexOf(userId);
  let favorited = false;

  if (index > -1) {
    project.isFavorited.splice(index, 1);
  } else {
    project.isFavorited.push(userId);
    favorited = true;
  }

  await project.save();
  await deleteCache(CACHE_KEYS.projectById(projectId));
  return { favorited };
};

const addProjectMember = async (projectId, { email, role }, requestingUserId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const isManager = project.members.some(
    m => m.userId.toString() === requestingUserId.toString() && m.role === 'manager'
  );
  
  const org = await Org.findById(project.orgId);
  const isOrgAdmin = org && org.members.some(
    m => m.userId.toString() === requestingUserId.toString() && ['owner', 'admin'].includes(m.role)
  );

  if (!isManager && !isOrgAdmin) {
    throw new ApiError(403, 'You do not have permission to add members to this project');
  }

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    throw new ApiError(404, 'User not found with this email');
  }

  const isAlreadyMember = project.members.some(m => m.userId.toString() === userToAdd._id.toString());
  if (isAlreadyMember) {
    throw new ApiError(409, 'User is already a member of this project');
  }

  project.members.push({
    userId: userToAdd._id,
    role: role || 'developer'
  });

  await project.save();
  await deleteCache(CACHE_KEYS.projectById(projectId));
  return project.populate('members.userId', 'name email avatar');
};

const removeProjectMember = async (projectId, memberUserId, requestingUserId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const isManager = project.members.some(
    m => m.userId.toString() === requestingUserId.toString() && m.role === 'manager'
  );
  
  const org = await Org.findById(project.orgId);
  const isOrgAdmin = org && org.members.some(
    m => m.userId.toString() === requestingUserId.toString() && ['owner', 'admin'].includes(m.role)
  );

  if (!isManager && !isOrgAdmin && requestingUserId.toString() !== memberUserId.toString()) {
    throw new ApiError(403, 'You do not have permission to remove members from this project');
  }

  if (project.createdBy.toString() === memberUserId.toString()) {
    throw new ApiError(400, 'Cannot remove the project creator');
  }

  const index = project.members.findIndex(m => m.userId.toString() === memberUserId.toString());
  if (index === -1) {
    throw new ApiError(404, 'User is not a member of this project');
  }

  project.members.splice(index, 1);
  await project.save();
  
  await deleteCache(CACHE_KEYS.projectById(projectId));
  return { removed: true };
};

const updateProjectStatuses = async (projectId, requestingUserId, taskStatuses) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const isManager = project.members.some(
    m => m.userId.toString() === requestingUserId.toString() && m.role === 'manager'
  );
  
  const org = await Org.findById(project.orgId);
  const isOrgAdmin = org && org.members.some(
    m => m.userId.toString() === requestingUserId.toString() && ['owner', 'admin'].includes(m.role)
  );

  if (!isManager && !isOrgAdmin) {
    throw new ApiError(403, 'You do not have permission to update project statuses');
  }

  project.taskStatuses = taskStatuses;
  await project.save();
  await deleteCache(CACHE_KEYS.projectById(projectId));
  return project;
};

module.exports = {
  createProject,
  getProjectsByOrg,
  getProjectById,
  updateProject,
  deleteProject,
  toggleFavorite,
  addProjectMember,
  removeProjectMember,
  updateProjectStatuses
};
