import axiosInstance from '../utils/axiosInstance';

export const getOrgOverview = async (orgId) => {
  const response = await axiosInstance.get(`/analytics/org/${orgId}/overview`);
  return response.data;
};

export const getProjectStats = async (projectId) => {
  const response = await axiosInstance.get(`/analytics/project/${projectId}/stats`);
  return response.data;
};

export const getTaskCompletion = async (projectId, days = 30) => {
  const response = await axiosInstance.get(`/analytics/project/${projectId}/completion?days=${days}`);
  return response.data;
};

export const getMemberProductivity = async (projectId) => {
  const response = await axiosInstance.get(`/analytics/project/${projectId}/members`);
  return response.data;
};

export const getWeeklyProgress = async (orgId) => {
  const response = await axiosInstance.get(`/analytics/org/${orgId}/weekly`);
  return response.data;
};

export default {
  getOrgOverview,
  getProjectStats,
  getTaskCompletion,
  getMemberProductivity,
  getWeeklyProgress
};
