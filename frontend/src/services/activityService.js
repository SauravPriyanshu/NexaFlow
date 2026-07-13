import axiosInstance from '../utils/axiosInstance';

const activityService = {
  getProjectActivity: async (projectId, page = 1, limit = 50) => {
    return axiosInstance.get(`/activity/project/${projectId}`, {
      params: { page, limit }
    });
  },

  getOrgActivity: async (orgId, page = 1, limit = 50) => {
    return axiosInstance.get(`/activity/org/${orgId}`, {
      params: { page, limit }
    });
  },

  getTaskActivity: async (taskId, page = 1, limit = 50) => {
    return axiosInstance.get(`/activity/task/${taskId}`, {
      params: { page, limit }
    });
  }
};

export default activityService;
