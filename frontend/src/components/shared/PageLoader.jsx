import React from 'react';
import Logo from './Logo';

export default function PageLoader() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand">
      <div className="animate-pulse flex flex-col items-center">
        <div className="scale-110">
          <Logo />
        </div>
        <p className="text-[13px] text-text-muted mt-4">Loading NexaFlow...</p>
      </div>
    </div>
  );
}
