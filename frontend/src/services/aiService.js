import axiosInstance from '../utils/axiosInstance';

export const runAI = async (type, input) => {
  const response = await axiosInstance.post('/ai', { type, input });
  return response.data;
};

export default { runAI };
