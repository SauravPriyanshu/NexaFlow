import React from 'react';

const Logo = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className="relative flex-shrink-0" 
        style={{ width: '28px', height: '28px', marginRight: '12px' }}
        aria-hidden="true"
      >
        <div className="absolute top-0 left-0 w-[60%] h-[60%] border-[2px] border-accent rounded-[2px]" />
        <div className="absolute bottom-0 right-0 border-[2px] border-accent rounded-[2px] bg-accent/20 backdrop-blur-[2px] w-[60%] h-[60%]" />
      </div>
      <span 
        className="font-semibold tracking-tight"
        style={{ fontSize: '26px', lineHeight: '28px' }}
      >
        <span className="text-text-main">Nexa</span>
        <span className="text-accent">Flow</span>
      </span>
    </div>
  );
};

export default Logo;
