const orgService = require('./org.service');
const ApiResponse = require('../../shared/utils/ApiResponse');

const createOrg = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const org = await orgService.createOrg({
      name,
      description,
      ownerId: req.user._id
    });
    res.status(201).json(new ApiResponse(201, org, 'Organization created successfully'));
  } catch (err) {
    next(err);
  }
};

const getMyOrgs = async (req, res, next) => {
  try {
    const orgs = await orgService.getMyOrgs(req.user._id);
    res.status(200).json(new ApiResponse(200, orgs, 'Organizations retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

const getOrgById = async (req, res, next) => {
  try {
    const org = await orgService.getOrgById(req.params.orgId);
    res.status(200).json(new ApiResponse(200, org, 'Organization retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

const updateOrg = async (req, res, next) => {
  try {
    const { name, description, logo } = req.body;
    const org = await orgService.updateOrg(req.params.orgId, { name, description, logo });
    res.status(200).json(new ApiResponse(200, org, 'Organization updated successfully'));
  } catch (err) {
    next(err);
  }
};

const deleteOrg = async (req, res, next) => {
  try {
    await orgService.deleteOrg(req.params.orgId, req.user._id);
    res.status(200).json(new ApiResponse(200, null, 'Organization deleted successfully'));
  } catch (err) {
    next(err);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const org = await orgService.inviteMember(req.params.orgId, { email, role }, req.user);
    res.status(200).json(new ApiResponse(200, org, 'Member invited successfully'));
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const org = await orgService.removeMember(req.params.orgId, req.params.memberId);
    res.status(200).json(new ApiResponse(200, org, 'Member removed successfully'));
  } catch (err) {
    next(err);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const org = await orgService.updateMemberRole(req.params.orgId, req.params.memberId, role);
    res.status(200).json(new ApiResponse(200, org, 'Member role updated successfully'));
  } catch (err) {
    next(err);
  }
};

const leaveOrg = async (req, res, next) => {
  try {
    const result = await orgService.leaveOrg(req.params.orgId, req.user._id);
    res.status(200).json(new ApiResponse(200, result, 'Left organization successfully'));
  } catch (err) {
    next(err);
  }
};

const transferOwnership = async (req, res, next) => {
  try {
    const { newOwnerId } = req.body;
    const org = await orgService.transferOwnership(req.params.orgId, req.user._id, newOwnerId);
    res.status(200).json(new ApiResponse(200, org, 'Ownership transferred successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrg,
  getMyOrgs,
  getOrgById,
  updateOrg,
  deleteOrg,
  inviteMember,
  removeMember,
  updateMemberRole,
  leaveOrg,
  transferOwnership
};
