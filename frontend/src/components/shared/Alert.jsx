import React, { useState, useEffect } from 'react';
import { XCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({ variant = 'info', message, dismissible = true, onClose, className = '' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isEntering, setIsEntering] = useState(true);
  
  useEffect(() => {
    setIsVisible(true);
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 300);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message || !isVisible) return null;

  const variants = {
    error: {
      border: 'border-l-error',
      bg: 'bg-error/10',
      icon: <XCircle className="text-error mt-0.5" size={18} />,
      text: 'text-error'
    },
    success: {
      border: 'border-l-success',
      bg: 'bg-success/10',
      icon: <CheckCircle className="text-success mt-0.5" size={18} />,
      text: 'text-success'
    },
    warning: {
      border: 'border-l-warning',
      bg: 'bg-warning/10',
      icon: <AlertTriangle className="text-warning mt-0.5" size={18} />,
      text: 'text-warning'
    },
    info: {
      border: 'border-l-accent',
      bg: 'bg-accent/10',
      icon: <Info className="text-accent mt-0.5" size={18} />,
      text: 'text-text-main'
    }
  };

  const style = variants[variant] || variants.info;

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div 
      className={`
        flex items-start p-3 border-l-[3px] rounded-r-lg shadow-sm
        ${style.border} ${style.bg} ${className}
        transition-all duration-300 ease-out
        ${isEntering ? 'opacity-0 translate-y-[-10px]' : 'opacity-100 translate-y-0'}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">
        {style.icon}
      </div>
      <div className={`text-sm font-medium pt-[1px] flex-1 ${style.text}`}>
        {message}
      </div>
      {dismissible && (
        <button 
          onClick={handleClose}
          className="ml-auto pl-3 flex-shrink-0 text-text-sub hover:text-text-main transition-colors focus:outline-none"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
