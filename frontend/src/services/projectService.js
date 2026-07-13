import axiosInstance from '../utils/axiosInstance';

const projectService = {
  createProject: async (data) => {
    const response = await axiosInstance.post('/projects', data);
    return response.data;
  },

  getProjectsByOrg: async (orgId) => {
    const response = await axiosInstance.get(`/projects/org/${orgId}`);
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  },

  updateProject: async (id, data) => {
    const response = await axiosInstance.patch(`/projects/${id}`, data);
    return response.data;
  },

  updateProjectStatuses: async (id, taskStatuses) => {
    const response = await axiosInstance.patch(`/projects/${id}/statuses`, { taskStatuses });
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  },

  toggleFavorite: async (id) => {
    const response = await axiosInstance.patch(`/projects/${id}/favorite`);
    return response.data;
  },

  addMember: async (id, data) => {
    const response = await axiosInstance.post(`/projects/${id}/members`, data);
    return response.data;
  },

  removeMember: async (id, memberId) => {
    const response = await axiosInstance.delete(`/projects/${id}/members/${memberId}`);
    return response.data;
  }
};

export default projectService;
