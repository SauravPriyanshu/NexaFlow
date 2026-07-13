import axiosInstance from '../utils/axiosInstance';

const fileService = {
  uploadFile: async (projectId, formData, onUploadProgress) => {
    return axiosInstance.post(`/files/upload/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress
    });
  },

  getFilesByProject: async (projectId, params = {}) => {
    return axiosInstance.get(`/files/project/${projectId}`, { params });
  },

  getFilesByTask: async (taskId) => {
    return axiosInstance.get(`/files/task/${taskId}`);
  },

  deleteFile: async (id) => {
    return axiosInstance.delete(`/files/${id}`);
  },

  renameFile: async (id, name) => {
    return axiosInstance.patch(`/files/${id}/rename`, { newName: name });
  }
};

export default fileService;
