import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center px-4 py-8 sm:px-6 overflow-y-auto"
      style={{ 
        backgroundColor: 'var(--bg-page)',
        backgroundImage: `linear-gradient(rgba(6,182,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}
    >
      <div className="w-full flex items-center justify-center flex-1 my-auto">
        <div 
          className="relative z-10 bg-surface border border-border-custom shadow-2xl rounded-2xl w-full"
          style={{
            maxWidth: '420px',
            padding: '32px',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
