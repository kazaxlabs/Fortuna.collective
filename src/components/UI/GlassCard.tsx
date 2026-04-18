import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`neu-convex rounded-[2.5rem] ${className}`}
    >
      {children}
    </div>
  );
}
