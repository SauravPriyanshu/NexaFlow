import axiosInstance from '../utils/axiosInstance';
import axios from 'axios';

class AuthService {
  async login(email, password) {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  }

  async googleLogin(credential) {
    const response = await axiosInstance.post('/auth/google', { credential });
    return response.data;
  }

  async logout() {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  }

  async refresh() {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    return response.data;
  }
}

export default new AuthService();
