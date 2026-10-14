'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx("animate-pulse rounded-clinic-10 bg-zinc-200 dark:bg-zinc-800", className)
      )}
      {...props}
    />
  );
}

export default Skeleton;
