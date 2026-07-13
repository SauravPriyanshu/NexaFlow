import axiosInstance from '../utils/axiosInstance';

const commentService = {
  createComment: async (data) => {
    return axiosInstance.post('/comments', data);
  },

  getCommentsByTask: async (taskId) => {
    return axiosInstance.get(`/comments/task/${taskId}`);
  },

  updateComment: async (id, content) => {
    return axiosInstance.patch(`/comments/${id}`, { content });
  },

  deleteComment: async (id) => {
    return axiosInstance.delete(`/comments/${id}`);
  },

  toggleLike: async (id) => {
    return axiosInstance.post(`/comments/${id}/like`);
  }
};

export default commentService;
