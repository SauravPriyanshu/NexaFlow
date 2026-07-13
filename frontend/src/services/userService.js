import axiosInstance from '../utils/axiosInstance';

const getProfile = () => {
  return axiosInstance.get('/users/profile');
};

const updateProfile = (data) => {
  return axiosInstance.patch('/users/profile', data);
};

export default {
  getProfile,
  updateProfile
};
