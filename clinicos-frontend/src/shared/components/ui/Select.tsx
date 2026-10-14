'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
<<<<<<< HEAD
          <label className="text-xs font-medium tracking-wide text-clinic-text-primary">
=======
          <label className="text-xs font-semibold uppercase tracking-wider text-clinic-text-secondary">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={twMerge(
              clsx(
<<<<<<< HEAD
                "w-full px-3.5 py-2.5 text-sm bg-clinic-surface text-clinic-text-primary border border-clinic-border rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-clinic-accent/20 focus:border-clinic-accent disabled:opacity-50 disabled:pointer-events-none appearance-none cursor-pointer",
=======
                "w-full px-3 py-2 text-sm bg-clinic-surface text-clinic-text-primary border border-clinic-border rounded-clinic-10 transition-colors focus:outline-none focus:ring-1 focus:ring-clinic-accent focus:border-clinic-accent disabled:opacity-50 disabled:pointer-events-none appearance-none cursor-pointer",
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                error && "border-clinic-danger focus:ring-clinic-danger",
                className
              )
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-clinic-text-secondary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-xs text-clinic-danger font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
