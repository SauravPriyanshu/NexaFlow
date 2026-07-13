const projectService = require('./project.service');
const ApiResponse = require('../../shared/utils/ApiResponse');

const createProject = async (req, res, next) => {
  try {
    const projectData = { ...req.body, createdBy: req.user._id };
    if (!projectData.dueDate) {
      delete projectData.dueDate;
    }
    const project = await projectService.createProject(projectData);
    res.status(201).json(new ApiResponse(201, project, 'Project created successfully'));
  } catch (err) {
    next(err);
  }
};

const getProjectsByOrg = async (req, res, next) => {
  try {
    const projects = await projectService.getProjectsByOrg(req.params.orgId, req.user._id);
    res.status(200).json(new ApiResponse(200, projects, 'Projects retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId, req.user._id);
    res.status(200).json(new ApiResponse(200, project, 'Project retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.projectId, req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, project, 'Project updated successfully'));
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.projectId, req.user._id);
    res.status(200).json(new ApiResponse(200, null, 'Project deleted successfully'));
  } catch (err) {
    next(err);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const result = await projectService.toggleFavorite(req.params.projectId, req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Project favorite toggled successfully'));
  } catch (err) {
    next(err);
  }
};

const addProjectMember = async (req, res, next) => {
  try {
    const project = await projectService.addProjectMember(req.params.projectId, req.body, req.user._id);
    res.status(200).json(new ApiResponse(200, project, 'Member added to project successfully'));
  } catch (err) {
    next(err);
  }
};

const removeProjectMember = async (req, res, next) => {
  try {
    await projectService.removeProjectMember(req.params.projectId, req.params.memberId, req.user._id);
    res.status(200).json(new ApiResponse(200, null, 'Member removed from project successfully'));
  } catch (err) {
    next(err);
  }
};

const updateProjectStatuses = async (req, res, next) => {
  try {
    const project = await projectService.updateProjectStatuses(req.params.projectId, req.user._id, req.body.taskStatuses);
    res.status(200).json(new ApiResponse(200, project, 'Project statuses updated successfully'));
  } catch (err) {
    next(err);
  }
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
