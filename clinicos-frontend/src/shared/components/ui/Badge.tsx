'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border tracking-[0.01em]';
  
  const variants = {
    neutral: 'bg-clinic-bg text-clinic-text-secondary border-clinic-border',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 text-clinic-success border-emerald-200/80 dark:border-emerald-900/50',
    warning: 'bg-amber-50 dark:bg-amber-950/30 text-clinic-warning border-amber-200/80 dark:border-amber-900/50',
    danger: 'bg-rose-50 dark:bg-rose-950/30 text-clinic-danger border-rose-200/80 dark:border-rose-900/50',
    info: 'bg-teal-50 dark:bg-teal-950/30 text-clinic-accent border-teal-200/80 dark:border-teal-900/50',
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
