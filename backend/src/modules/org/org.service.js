const Org = require('./org.model');
const User = require('../user/user.model');
const ApiError = require('../../shared/utils/ApiError');
const { sendOrgInviteEmail } = require('../../shared/utils/sendEmail');
const { getCache, setCache, deleteCache, deleteCachePattern, TTL_LONG, TTL_MEDIUM } = require('../../shared/utils/cache');
const CACHE_KEYS = require('../../shared/utils/cacheKeys');

const createOrg = async ({ name, description, ownerId }) => {
  const org = new Org({
    name,
    description,
    ownerId,
    members: [{
      userId: ownerId,
      role: 'owner',
      joinedAt: new Date()
    }]
  });
  await org.save();
  await deleteCache(CACHE_KEYS.userOrgs(ownerId));
  return org;
};

const getMyOrgs = async (userId) => {
  const cacheKey = CACHE_KEYS.userOrgs(userId);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const orgs = await Org.find({ 'members.userId': userId })
    .populate('members.userId', 'name email avatar')
    .lean();
    
  await setCache(cacheKey, orgs, TTL_MEDIUM);
  return orgs;
};

const getOrgById = async (orgId) => {
  const cacheKey = CACHE_KEYS.orgMembers(orgId);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const org = await Org.findById(orgId)
    .populate('members.userId', 'name email avatar')
    .lean();
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }
  
  await setCache(cacheKey, org, TTL_LONG);
  return org;
};

const updateOrg = async (orgId, { name, description, logo }) => {
  const org = await Org.findByIdAndUpdate(
    orgId,
    { name, description, logo },
    { new: true, runValidators: true }
  ).populate('members.userId', 'name email avatar');
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }
  await deleteCache(CACHE_KEYS.orgMembers(orgId));
  return org;
};

const deleteOrg = async (orgId, requestingUserId) => {
  const org = await Org.findById(orgId);
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }
  
  if (org.ownerId.toString() !== requestingUserId.toString()) {
    throw new ApiError(403, 'Only the organization owner can delete it');
  }
  
  await org.deleteOne();
  await deleteCache(CACHE_KEYS.orgMembers(orgId));
  await deleteCachePattern('user:orgs:*');
  return { message: 'Organization deleted successfully' };
};

const inviteMember = async (orgId, { email, role }, inviter) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found. They must register first.');
  }

  const org = await Org.findById(orgId);
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }

  const existingMember = org.members.find(m => m.userId.toString() === user._id.toString());
  if (existingMember) {
    throw new ApiError(409, 'Already a member');
  }

  org.members.push({
    userId: user._id,
    role: role || 'developer',
    joinedAt: new Date()
  });

  await org.save();
  await org.populate('members.userId', 'name email avatar');

  // TODO Phase 2: emit socket event to invitee's personal room if online

  try {
    await sendOrgInviteEmail(email, org.name, inviter.name, role || 'developer');
  } catch (error) {
    console.error('Failed to send invite email:', error);
  }

  await deleteCache(CACHE_KEYS.orgMembers(orgId));
  await deleteCache(CACHE_KEYS.userOrgs(user._id));

  return org;
};

const removeMember = async (orgId, memberUserId) => {
  const org = await Org.findById(orgId);
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }

  if (org.ownerId.toString() === memberUserId.toString()) {
    throw new ApiError(400, 'Cannot remove the owner of the organization');
  }

  org.members = org.members.filter(m => m.userId.toString() !== memberUserId.toString());
  await org.save();
  await org.populate('members.userId', 'name email avatar');
  
  await deleteCache(CACHE_KEYS.orgMembers(orgId));
  await deleteCache(CACHE_KEYS.userOrgs(memberUserId));
  
  return org;
};

const updateMemberRole = async (orgId, memberUserId, newRole) => {
  const org = await Org.findById(orgId);
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }

  const member = org.members.find(m => m.userId.toString() === memberUserId.toString());
  if (!member) {
    throw new ApiError(404, 'Member not found in organization');
  }

  if (org.ownerId.toString() === memberUserId.toString()) {
    throw new ApiError(400, 'Cannot change the role of the organization owner');
  }

  member.role = newRole;
  await org.save();
  await org.populate('members.userId', 'name email avatar');
  
  await deleteCache(CACHE_KEYS.orgMembers(orgId));
  
  return org;
};

const leaveOrg = async (orgId, userId) => {
  const org = await Org.findById(orgId);
  if (!org) throw new ApiError(404, 'Organization not found');

  const member = org.members.find(m => m.userId.toString() === userId.toString());
  if (!member) throw new ApiError(403, 'Not a member');

  if (member.role === 'owner') {
    throw new ApiError(400, 'Owner cannot leave. Transfer ownership first.');
  }

  org.members = org.members.filter(m => m.userId.toString() !== userId.toString());
  await org.save();
  await deleteCache(CACHE_KEYS.orgMembers(orgId));
  await deleteCache(CACHE_KEYS.userOrgs(userId));
  return { message: 'Left organization successfully' };
};

const transferOwnership = async (orgId, currentOwnerId, newOwnerId) => {
  const org = await Org.findById(orgId);
  if (!org) throw new ApiError(404, 'Org not found');
  if (org.ownerId.toString() !== currentOwnerId.toString()) {
    throw new ApiError(403, 'Only the owner can transfer ownership');
  }
  const newOwnerMember = org.members.find(m => m.userId.toString() === newOwnerId.toString());
  if (!newOwnerMember) throw new ApiError(404, 'New owner must be a member');

  // Demote current owner to admin
  const currentOwnerMember = org.members.find(m => m.userId.toString() === currentOwnerId.toString());
  if (currentOwnerMember) currentOwnerMember.role = 'admin';

  // Promote new owner
  newOwnerMember.role = 'owner';
  org.ownerId = newOwnerId;

  await org.save();
  await deleteCache(CACHE_KEYS.orgMembers(orgId));
  return org;
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
