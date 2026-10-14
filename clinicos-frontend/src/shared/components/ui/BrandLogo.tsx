import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
    >
      {/* Background card accent for contrast */}
      <rect x="12" y="12" width="76" height="76" rx="20" className="fill-clinic-accent/10 dark:fill-clinic-accent/20" />
      
      {/* Precision interlocking geometric shapes (Styled C and O) */}
      <path
        d="M42 34C34 34 28 40 28 50C28 60 34 66 42 66C48.5 66 53 60 54 53"
        className="stroke-clinic-accent"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="62"
        cy="50"
        r="16"
        className="stroke-clinic-accent"
        strokeWidth="8.5"
        strokeLinecap="round"
      />
      
      {/* Precision focal point indicator */}
      <circle cx="50" cy="50" r="4" className="fill-clinic-accent" />
    </svg>
  );
}
