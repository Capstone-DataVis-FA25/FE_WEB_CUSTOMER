import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        'flex h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-sm transition-all outline-none md:text-sm',
        // Light theme - stronger borders
        'border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500',
        'hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
        // Dark theme  
        'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400',
        'dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400',
        // File input styles
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700 dark:file:text-gray-200',
        // Selection styles
        'selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-700 dark:selection:text-blue-100',
        // Disabled state
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700',
        // Invalid state
        'aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-400/20',
        className
      )}
      {...props}
    />
  );
}

export { Input };
