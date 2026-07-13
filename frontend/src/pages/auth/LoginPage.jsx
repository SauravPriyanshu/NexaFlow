import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Logo from '../../components/shared/Logo';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import Alert from '../../components/shared/Alert';

// SVGs
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);

const EyeIcon = ({ onClick }) => (
  <svg onClick={onClick} className="cursor-pointer hover:text-[#94a3b8] transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = ({ onClick }) => (
  <svg onClick={onClick} className="cursor-pointer hover:text-[#94a3b8] transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  useEffect(() => {
    document.title = "Sign in — NexaFlow";
    if (searchParams.get('error')) {
      setApiError('Google sign-in failed. Try again.');
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    // Note: We use redirect approach for backend passport implementation
    // This function can be kept for fallback or removed.
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const onGoogleError = () => {
    setApiError('Google Login failed.');
  };

  return (
    <div className="w-full">
      <div style={{ marginBottom: '0' }}>
        <Logo />
      </div>
      
      <h1 
        style={{
          fontSize: '20px',
          color: 'var(--text-primary)',
          fontWeight: 600,
          textAlign: 'center',
          marginTop: '0',
          marginBottom: '4px'
        }}
      >
        Welcome back
      </h1>
      
      <p 
        style={{
          fontSize: '13px',
          color: '#94a3b8',
          textAlign: 'center',
          marginTop: '0',
          marginBottom: '16px'
        }}
      >
        Sign in to your workspace
      </p>
      
      {apiError && <Alert variant="error" message={apiError} className="mb-5" onClose={() => setApiError(null)} />}
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Input
          label="Email address"
          type="email"
          placeholder="name@company.com"
          error={errors.email}
          leftIcon={<MailIcon />}
          autoFocus
          {...register("email", { 
            required: "Email is required",
            pattern: { value: /\S+@\S+\.\S+/, message: "Email is invalid" }
          })}
        />
        
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password}
          leftIcon={<LockIcon />}
          rightIcon={showPassword ? <EyeOffIcon onClick={() => setShowPassword(false)} /> : <EyeIcon onClick={() => setShowPassword(true)} />}
          {...register("password", { required: "Password is required" })}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div 
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: '1.5px solid var(--border-default)',
                backgroundColor: 'var(--bg-page)',
                flexShrink: 0
              }}
              className="group-hover:border-[#06b6d4] transition-colors group"
            >
              <input
                type="checkbox"
                style={{ position: 'absolute', opacity: 0, cursor: 'pointer', margin: 0, padding: 0, width: '100%', height: '100%' }}
                className="peer"
                {...register("rememberMe")}
              />
              <div 
                className="peer-checked:scale-100 scale-0 transition-transform"
                style={{
                  position: 'absolute',
                  inset: -1.5,
                  backgroundColor: '#06b6d4',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--bg-page)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3L4.5 8.5L2 6"></path>
                </svg>
              </div>
            </div>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Remember me</span>
          </label>
          
          <Link to="/forgot-password" style={{ fontSize: '13px', color: '#06b6d4', textDecoration: 'none' }} className="hover:underline">
            Forgot password?
          </Link>
        </div>
        
        <Button type="submit" variant="primary" fullWidth loading={isLoading}>
          Sign in
        </Button>
      </form>
      
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '16px',
          marginBottom: '12px'
        }}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-default)' }} />
        <span style={{ fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          or continue with
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-default)' }} />
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="secondary" 
          fullWidth 
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <GoogleIcon />
          Continue with Google
        </Button>
      </div>
      
      <div 
        style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#94a3b8'
        }}
      >
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 500 }} className="hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}
