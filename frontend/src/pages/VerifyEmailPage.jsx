import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const verifyEmail = async () => {
      try {
        await axiosInstance.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 transition-colors" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md rounded-xl p-8 text-center shadow-lg transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--accent)' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <svg className="h-6 w-6" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Email verified!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>You can now log in.</p>
            <Link
              to="/login"
              style={{ background: 'var(--accent)', color: '#fff' }}
              className="mt-4 inline-block rounded-md px-6 py-2 font-medium hover:bg-accent-hover transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <svg className="h-6 w-6" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
            <button 
              className="mt-4 inline-block rounded-md px-6 py-2 font-medium transition-colors"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            >
              Resend Verification Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
