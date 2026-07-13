import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Logo from '../../components/shared/Logo';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import Alert from '../../components/shared/Alert';
import axiosInstance from '../../utils/axiosInstance';

// SVGs
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

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

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', agreeTerms: false }
  });
  
  const passwordValue = watch('password', '');

  useEffect(() => {
    document.title = "Create account — NexaFlow";
  }, []);

  useEffect(() => {
    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
    
    let label = 'Weak';
    let color = '#ef4444';
    if (score === 2) { label = 'Fair'; color = '#f59e0b'; }
    else if (score === 3) { label = 'Good'; color = '#10b981'; }
    else if (score === 4) { label = 'Strong'; color = '#06b6d4'; }
    
    if (passwordValue.length === 0) {
      score = 0;
    }
    
    setStrength({ score, label, color });
  }, [passwordValue]);

  const onSubmit = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      await axiosInstance.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      navigate('/verify-email', { state: { email: data.email } });
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setApiError(null);
    setIsLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Google Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleError = () => {
    setApiError('Google Sign up failed.');
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
        Create your account
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
        Start collaborating in minutes
      </p>
      
      {apiError && <Alert variant="error" message={apiError} className="mb-5" onClose={() => setApiError(null)} />}
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Input
          label="Full name"
          placeholder="Alex Johnson"
          error={errors.name}
          leftIcon={<UserIcon />}
          autoFocus
          {...register("name", { required: "Name is required" })}
        />
        
        <Input
          label="Email address"
          type="email"
          placeholder="name@company.com"
          error={errors.email}
          leftIcon={<MailIcon />}
          {...register("email", { 
            required: "Email is required",
            pattern: { value: /\S+@\S+\.\S+/, message: "Email is invalid" }
          })}
        />
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            error={errors.password}
            leftIcon={<LockIcon />}
            rightIcon={showPassword ? <EyeOffIcon onClick={() => setShowPassword(false)} /> : <EyeIcon onClick={() => setShowPassword(true)} />}
            {...register("password", { 
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" }
            })}
          />
          
          {passwordValue && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4].map(num => (
                  <div 
                    key={num} 
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: strength.score >= num ? (strength.score === 4 ? '#06b6d4' : (num === 1 ? '#ef4444' : (strength.score === 2 ? '#f59e0b' : '#10b981'))) : 'var(--border-default)',
                      transition: 'background-color 0.3s'
                    }}
                  />
                ))}
              </div>
              <div 
                style={{ 
                  fontSize: '12px', 
                  textAlign: 'right', 
                  color: strength.color,
                  marginTop: '4px',
                  fontWeight: 500
                }}
              >
                {strength.label}
              </div>
            </div>
          )}
        </div>
        
        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          error={errors.confirmPassword}
          leftIcon={<LockIcon />}
          {...register("confirmPassword", { 
            validate: value => value === passwordValue || "Passwords do not match"
          })}
        />
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '2px' }}>
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
              className="group-hover:border-[#06b6d4] transition-colors"
            >
              <input
                type="checkbox"
                style={{ position: 'absolute', opacity: 0, cursor: 'pointer', margin: 0, padding: 0, width: '100%', height: '100%' }}
                className="peer"
                {...register("agreeTerms", { required: "You must agree to the terms" })}
              />
              <div 
                className="peer-checked:scale-100 scale-0 transition-transform"
                style={{
                  position: 'absolute',
                  inset: -1.5, /* to cover border */
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
            <span style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
              I agree to the <Link to="#" style={{ color: '#06b6d4', textDecoration: 'none' }} className="hover:underline">Terms of Service</Link> and <Link to="#" style={{ color: '#06b6d4', textDecoration: 'none' }} className="hover:underline">Privacy Policy</Link>
            </span>
          </label>
        </div>
        {errors.agreeTerms && (
          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '-12px', marginLeft: '26px' }}>
            {errors.agreeTerms.message}
          </div>
        )}
        
        <Button type="submit" variant="primary" fullWidth loading={isLoading}>
          Create account
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
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
          theme="filled_black"
          shape="rectangular"
          text="continue_with"
        />
      </div>
      
      <div 
        style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#94a3b8'
        }}
      >
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 500 }} className="hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
