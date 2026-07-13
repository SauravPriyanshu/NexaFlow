import axiosInstance from '../utils/axiosInstance';

const taskService = {
  createTask: async (data) => {
    const response = await axiosInstance.post('/tasks', data);
    return response.data;
  },

  getTasksByProject: async (projectId, filters = {}) => {
    const response = await axiosInstance.get(`/tasks/project/${projectId}`, { params: filters });
    return response.data;
  },

  getMyTasks: async () => {
    const response = await axiosInstance.get('/tasks/me');
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await axiosInstance.patch(`/tasks/${id}`, data);
    return response.data;
  },

  updateTaskStatus: async (id, data) => {
    const response = await axiosInstance.patch(`/tasks/${id}/status`, data);
    return response.data;
  },

  reorderTasks: async (projectId, tasks) => {
    const response = await axiosInstance.patch(`/tasks/project/${projectId}/reorder`, tasks);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data;
  },

  updateChecklist: async (id, data) => {
    const response = await axiosInstance.patch(`/tasks/${id}/checklist`, data);
    return response.data;
  }
};

export default taskService;
