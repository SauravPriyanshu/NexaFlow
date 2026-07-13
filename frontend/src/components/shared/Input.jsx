import React from 'react';

const Input = React.forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  ...rest
}, ref) => {
  const hasError = !!error;
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          style={{
            display: 'block',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            marginBottom: '4px'
          }}
        >
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        {LeftIcon && (
          <div 
            className="absolute z-10 flex items-center justify-center text-text-muted pointer-events-none"
            style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          >
            {typeof LeftIcon === 'function' ? <LeftIcon size={16} /> : React.cloneElement(LeftIcon, { size: 16 })}
          </div>
        )}
        
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`
            w-full bg-brand border rounded-md text-text-main placeholder-text-hint
            transition-all duration-200 outline-none
            ${hasError 
              ? 'border-error focus:border-error focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' 
              : 'border-border-custom focus:border-accent focus:shadow-[0_0_0_2px_rgba(6,182,212,0.15)] hover:border-accent/50'
            }
          `}
          style={{
            height: '38px',
            paddingTop: '0',
            paddingBottom: '0',
            paddingLeft: LeftIcon ? '34px' : '12px',
            paddingRight: RightIcon ? '34px' : '12px',
            backgroundColor: 'var(--bg-input)',
            fontSize: '13px'
          }}
          {...rest}
        />
        
        {RightIcon && (
          <div 
            className="absolute z-10 flex items-center justify-center text-text-muted"
            style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          >
            {typeof RightIcon === 'function' ? <RightIcon size={16} /> : React.cloneElement(RightIcon, { size: 16 })}
          </div>
        )}
      </div>
      
      {error && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--error)',
            marginTop: '4px'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error.message || error}</span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
