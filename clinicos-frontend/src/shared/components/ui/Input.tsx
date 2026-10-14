'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium tracking-wide text-clinic-text-primary">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              "w-full px-3.5 py-2.5 text-sm bg-clinic-surface text-clinic-text-primary border border-clinic-border rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-clinic-accent/20 focus:border-clinic-accent placeholder:text-clinic-text-secondary/75 disabled:opacity-50 disabled:pointer-events-none",
              error && "border-clinic-danger focus:ring-clinic-danger focus:border-clinic-danger",
              className
            )
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-clinic-danger font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, rows = 3, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium tracking-wide text-clinic-text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={twMerge(
            clsx(
              "w-full px-3.5 py-2.5 text-sm bg-clinic-surface text-clinic-text-primary border border-clinic-border rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-clinic-accent/20 focus:border-clinic-accent placeholder:text-clinic-text-secondary/75 disabled:opacity-50 disabled:pointer-events-none resize-none",
              error && "border-clinic-danger focus:ring-clinic-danger focus:border-clinic-danger",
              className
            )
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-clinic-danger font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Input;
