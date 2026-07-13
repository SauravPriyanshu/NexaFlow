import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance, { setAccessToken } from '../utils/axiosInstance';
import authService from '../services/authService';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await authService.refresh();
        const { accessToken, user: userData } = response.data;
        setAccessToken(accessToken);
        setUser(userData);
        if (userData?.theme && userData.theme !== 'system') {
          setTheme(userData.theme);
        }
      } catch (error) {
        // Session restore failed (e.g. no cookie, expired token, or CORS issue)
        console.warn('[Auth] Session restore failed:', error?.response?.status, error?.message);
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { accessToken, user: userData } = response.data;
    setAccessToken(accessToken);
    setUser(userData);
    if (userData?.theme && userData.theme !== 'system') {
      setTheme(userData.theme);
    }
    return response;
  };

  const googleLogin = async (credential) => {
    const response = await authService.googleLogin(credential);
    const { accessToken, user: userData } = response.data;
    setAccessToken(accessToken);
    setUser(userData);
    if (userData?.theme && userData.theme !== 'system') {
      setTheme(userData.theme);
    }
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
