import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import Alert from '../../components/shared/Alert';
import axiosInstance from '../../utils/axiosInstance';

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);

const LockOutlineIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5">
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const EnvelopeSuccessIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      await axiosInstance.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      <Link 
        to="/login" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#94a3b8',
          fontSize: '14px',
          textDecoration: 'none',
          cursor: 'pointer',
          fontWeight: 500,
          marginBottom: '24px'
        }}
        className="hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeftIcon />
        Back
      </Link>
      
      {!isSubmitted ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LockOutlineIcon />
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0,
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#06b6d4',
                  color: 'var(--bg-page)',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ?
              </div>
            </div>
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
            Forgot password
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
            No worries, we'll send you reset instructions.
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
            
            <Button type="submit" variant="primary" fullWidth loading={isLoading}>
              Reset password
            </Button>
          </form>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <EnvelopeSuccessIcon />
          </div>
          
          <h1 
            style={{
              fontSize: '24px',
              color: 'var(--text-primary)',
              fontWeight: 600,
              marginTop: '0',
              marginBottom: '8px'
            }}
          >
            Check your inbox
          </h1>
          
          <p 
            style={{
              fontSize: '14px',
              color: '#94a3b8',
              marginTop: '0',
              marginBottom: '8px',
              lineHeight: '1.5'
            }}
          >
            We sent a reset link to <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{submittedEmail}</strong>
          </p>
          
          <p 
            style={{
              fontSize: '13px',
              color: '#475569',
              marginTop: '0',
              marginBottom: '32px'
            }}
          >
            Check your spam folder if you don't see it.
          </p>
          
          <Link to="/login" style={{ width: '100%', textDecoration: 'none' }}>
            <Button variant="secondary" fullWidth>
              Back to sign in
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
