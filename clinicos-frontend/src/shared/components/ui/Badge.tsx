'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border';
  
  const variants = {
    neutral: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
    success: 'bg-green-50 dark:bg-green-950/30 text-clinic-success border-green-200 dark:border-green-900/50',
    warning: 'bg-amber-50 dark:bg-amber-950/30 text-clinic-warning border-amber-200 dark:border-amber-900/50',
    danger: 'bg-red-50 dark:bg-red-950/30 text-clinic-danger border-red-200 dark:border-red-900/50',
    info: 'bg-blue-50 dark:bg-blue-950/30 text-clinic-accent border-blue-200 dark:border-blue-900/50',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
