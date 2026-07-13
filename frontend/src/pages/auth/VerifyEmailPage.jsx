import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/shared/Button';
import Spinner from '../../components/shared/Spinner';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const location = useLocation();
  const email = location.state?.email || '[your email]';
  
  const [status, setStatus] = useState(token ? 'loading' : 'idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const toast = useToast();
  const { setTokens } = useAuth();
  
  const hasCalled = useRef(false);

  useEffect(() => {
    document.title = "Verify Email — NexaFlow";
    
    if (token && !hasCalled.current) {
      hasCalled.current = true;
      verifyToken(token);
    }
  }, [token]);
  
  // Timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyToken = async (verifyTokenStr) => {
    try {
      setStatus('loading');
      const response = await axiosInstance.get(`/auth/verify-email?token=${verifyTokenStr}`);
      
      // Auto login if possible, or just show success
      // If the backend returns tokens on verification success (we didn't build this, but if it does):
      if (response.data.data?.accessToken) {
        setTokens(response.data.data.accessToken, response.data.data.refreshToken);
      }
      
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMsg(error.response?.data?.message || 'Verification failed. The link may have expired.');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    try {
      await axiosInstance.post('/auth/resend-verification', { email });
      toast.success('Verification email resent successfully');
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="w-full text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {status === 'idle' && (
        <>
          <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 18L13.5 13.5" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1 className="text-2xl font-semibold text-text-main mb-3">Check your email</h1>
          <p className="text-sm text-text-sub mb-2">
            We sent a verification link to <span className="text-accent font-medium">{email}</span>. 
            Click the link to activate your account.
          </p>
          <p className="text-[13px] text-text-hint mb-8">The link expires in 24 hours.</p>
          
          <div className="h-px w-full bg-border-custom mb-6" />
          
          <div className="flex flex-col gap-4">
            <Button 
              variant="ghost" 
              fullWidth 
              onClick={handleResend}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend verification email'}
            </Button>
            
            <Link to="/login" className="text-sm font-medium text-text-sub hover:text-text-main transition-colors">
              Back to sign in
            </Link>
          </div>
        </>
      )}

      {status === 'loading' && (
        <div className="py-8 flex flex-col items-center">
          <Spinner size={32} className="text-accent mb-6" />
          <h1 className="text-xl font-medium text-text-main">Verifying your email...</h1>
          <p className="text-sm text-text-sub mt-2">Please wait a moment.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-4">
          <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-main mb-3">Email verified!</h1>
          <p className="text-sm text-text-sub mb-8">You can now sign in to NexaFlow.</p>
          
          <Link to="/login">
            <Button fullWidth>Go to sign in</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-4">
          <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-error/10 border border-error/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-main mb-3">Verification failed</h1>
          <p className="text-sm text-error mb-8">{errorMsg}</p>
          
          <Button fullWidth onClick={() => { setStatus('idle'); setToken(null); navigate('/verify-email'); }}>
            Request new link
          </Button>
        </div>
      )}

    </div>
  );
};

export default VerifyEmailPage;
