import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 16, className = '' }) => {
  return (
    <Loader2 
      size={size} 
      className={`animate-spin ${className}`} 
      aria-hidden="true" 
    />
  );
};

export default Spinner;
