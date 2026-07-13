import React, { useEffect, useState } from 'react';
import { XCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ variant = 'info', message, onClose }) => {
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsEntering(true);
    const timer = requestAnimationFrame(() => setIsEntering(false));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // match exit transition duration
  };

  const variants = {
    error: {
      border: 'border-l-error',
      icon: <XCircle className="text-error mt-0.5" size={18} />,
    },
    success: {
      border: 'border-l-success',
      icon: <CheckCircle className="text-success mt-0.5" size={18} />,
    },
    warning: {
      border: 'border-l-warning',
      icon: <AlertTriangle className="text-warning mt-0.5" size={18} />,
    },
    info: {
      border: 'border-l-accent',
      icon: <Info className="text-accent mt-0.5" size={18} />,
    }
  };

  const style = variants[variant] || variants.info;

  return (
    <div
      className={`
        flex items-start p-4 bg-surface border border-border-custom border-l-4 ${style.border} rounded shadow-lg min-w-[280px] max-w-[400px]
        transition-all duration-300 ease-out origin-right
        ${isEntering ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        ${isExiting ? 'opacity-0 translate-x-full' : ''}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">
        {style.icon}
      </div>
      <div className="text-sm font-medium pt-[1px] flex-1 text-text-main">
        {message}
      </div>
      <button 
        onClick={handleClose}
        className="ml-3 flex-shrink-0 text-text-sub hover:text-text-main transition-colors focus:outline-none"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
