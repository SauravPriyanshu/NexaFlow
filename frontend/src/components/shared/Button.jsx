import React from 'react';
import Spinner from './Spinner';

const Button = ({ 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  fullWidth = false, 
  onClick, 
  children, 
  type = 'button',
  className = ''
}) => {
  const baseClasses = "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand";
  
  const variants = {
    primary: "border-transparent active:scale-[0.99] disabled:active:scale-100",
    secondary: "border active:scale-[0.99]",
    ghost: "border-none bg-transparent active:scale-[0.99]",
    danger: "bg-transparent border active:scale-[0.99]"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  const cursorClass = (disabled || loading) ? "cursor-not-allowed" : "cursor-pointer";
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${cursorClass} ${className} btn-${variant}`}
      style={{
        height: '38px',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.3px',
        borderRadius: '6px',
        background: variant === 'primary' ? 'var(--accent)' : variant === 'secondary' ? 'var(--bg-card)' : 'transparent',
        color: variant === 'primary' ? 'var(--bg-page)' : variant === 'danger' ? 'var(--color-error)' : 'var(--text-primary)',
        borderColor: variant === 'secondary' ? 'var(--border-default)' : variant === 'danger' ? 'var(--color-error)' : 'transparent'
      }}
    >
      {loading ? (
        <Spinner size={16} className="text-current" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
