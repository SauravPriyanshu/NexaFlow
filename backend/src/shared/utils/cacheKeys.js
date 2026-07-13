const CACHE_KEYS = {
  userOrgs: (userId) => `user:orgs:${userId}`,
  orgMembers: (orgId) => `org:members:${orgId}`,
  orgProjects: (orgId, userId) => `org:projects:${orgId}:${userId}`,
  projectById: (projectId) => `project:${projectId}`,
  projectMembers: (projectId) => `project:members:${projectId}`,
  userProfile: (userId) => `user:profile:${userId}`,
  userNotifCount: (userId) => `user:notif:unread:${userId}`,
  tasksByProject: (projectId) => `tasks:project:${projectId}`,
  aiRateLimit: (userId) => `ai:ratelimit:${userId}`
};

module.exports = CACHE_KEYS;
