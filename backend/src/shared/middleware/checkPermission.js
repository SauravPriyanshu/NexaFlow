const ApiError = require('../utils/ApiError');
const Org = require('../../modules/org/org.model');
const Project = require('../../modules/project/project.model');
const { hasPermission } = require('../utils/permissions');

const checkPermission = (action) => {
  return async (req, res, next) => {
    try {
      const { orgId, projectId } = req.params;
      const userId = req.user._id.toString();

      let role = null;

      // Step 1: if projectId in params, check project-level role first
      if (projectId) {
        const project = await Project.findById(projectId).select('members orgId');
        if (!project) throw new ApiError(404, 'Project not found');

        const projectMember = project.members.find(
          (m) => m.userId.toString() === userId
        );
        if (projectMember) {
          role = projectMember.role;
          req.resourceOrgId = project.orgId;
        }
      }

      // Step 2: fall back to org-level role
      if (!role && orgId) {
        const org = await Org.findById(orgId).select('members');
        if (!org) throw new ApiError(404, 'Organization not found');

        const orgMember = org.members.find(
          (m) => m.userId.toString() === userId
        );
        if (!orgMember) throw new ApiError(403, 'Not a member of this organization');
        role = orgMember.role;
      }

      if (!role) throw new ApiError(403, 'Access denied');

      if (!hasPermission(role, action)) {
        throw new ApiError(403, `Permission denied: ${action} required. Your role: ${role}`);
      }

      req.memberRole = role;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = checkPermission;
