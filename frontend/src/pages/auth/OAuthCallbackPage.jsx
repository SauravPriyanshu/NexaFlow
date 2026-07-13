import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { setAccessToken } from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/shared/Logo';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processOAuth = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('token');

      if (token) {
        setAccessToken(token);
        try {
          const response = await axiosInstance.get('/users/me');
          login(response.data.data);
          navigate('/dashboard');
        } catch (error) {
          navigate('/login?error=oauth_failed');
        }
      } else {
        navigate('/login?error=oauth_failed');
      }
    };

    processOAuth();
  }, [navigate, login]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <Logo />
      <div className="mt-8 text-text-main text-lg animate-pulse">
        Completing sign in...
      </div>
    </div>
  );
}
