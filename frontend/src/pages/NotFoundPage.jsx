import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/shared/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand"
         style={{
           backgroundImage: 'radial-gradient(circle at center, var(--border-default) 1px, transparent 1px)',
           backgroundSize: '24px 24px'
         }}>
      <div className="text-center p-8 bg-brand/80 backdrop-blur-sm rounded-xl">
        <h1 className="text-[72px] font-bold text-accent leading-none mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary mb-3">Page not found</h2>
        <p className="text-text-muted mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="primary" onClick={() => navigate('/')}>Go home</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    </div>
  );
}
