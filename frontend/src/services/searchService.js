import axiosInstance from '../utils/axiosInstance';

export const globalSearch = async (orgId, query, types = [], limit = 5) => {
  const params = new URLSearchParams({ q: query, limit });
  if (types.length > 0) {
    params.append('types', types.join(','));
  }
  const response = await axiosInstance.get(`/search/${orgId}?${params.toString()}`);
  return response.data;
};

export default { globalSearch };
