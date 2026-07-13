import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setApiError('');
      setSuccessMessage('');
      await axiosInstance.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setSuccessMessage('Check your email to verify your account');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 transition-colors" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md space-y-8 rounded-xl p-8 shadow-lg transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Create an account</h2>
        </div>
        
        {apiError && (
          <div className="rounded-md p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p className="text-sm" style={{ color: '#ef4444' }}>{apiError}</p>
          </div>
        )}

        {successMessage && (
          <div className="rounded-md p-4" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <p className="text-sm" style={{ color: '#10b981' }}>{successMessage}</p>
          </div>
        )}

        {!successMessage && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  style={{ 
                    background: 'var(--bg-input)', 
                    color: 'var(--text-primary)',
                    borderColor: errors.name ? '#ef4444' : 'var(--border-default)'
                  }}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  style={{ 
                    background: 'var(--bg-input)', 
                    color: 'var(--text-primary)',
                    borderColor: errors.email ? '#ef4444' : 'var(--border-default)'
                  }}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <input
                  id="password"
                  type="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                      message: 'Password must contain at least one uppercase letter and one number'
                    }
                  })}
                  style={{ 
                    background: 'var(--bg-input)', 
                    color: 'var(--text-primary)',
                    borderColor: errors.password ? '#ef4444' : 'var(--border-default)'
                  }}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  style={{ 
                    background: 'var(--bg-input)', 
                    color: 'var(--text-primary)',
                    borderColor: errors.confirmPassword ? '#ef4444' : 'var(--border-default)'
                  }}
                  className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors`}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                style={{ background: 'var(--accent)', color: '#fff' }}
                className="flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--bg-page)] transition-colors"
              >
                Register
              </button>
            </div>
          </form>
        )}
        <div className="text-center text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--accent)' }} className="font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
