'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinic-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:translate-y-px';
    
    const variants = {
      primary: 'bg-clinic-accent text-white hover:bg-[#0F6A61] shadow-[0_2px_5px_rgba(15,90,80,0.16)] border border-transparent',
      secondary: 'bg-clinic-surface text-clinic-text-primary border border-clinic-border hover:bg-clinic-bg hover:border-clinic-accent/30 shadow-sm',
      ghost: 'bg-transparent text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg',
      destructive: 'bg-clinic-danger text-white hover:brightness-95 shadow-sm border border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base',
    };

    const MotionButton = motion.button as any;

    return (
      <MotionButton
        ref={ref}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';
export default Button;
