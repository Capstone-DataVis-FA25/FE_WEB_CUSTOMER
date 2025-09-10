import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base styles - improved visibility
        'peer size-4 shrink-0 rounded-[4px] border-2 shadow-sm transition-all outline-none',
        // Light theme - stronger borders and backgrounds
        'border-gray-400 bg-white hover:border-blue-500 focus-visible:border-blue-500',
        // Dark theme
        'dark:border-gray-500 dark:bg-gray-800 dark:hover:border-blue-400 dark:focus-visible:border-blue-400',
        // Checked state - more visible
        'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white',
        'dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:border-blue-500',
        // Focus ring
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-50',
        'dark:focus-visible:ring-blue-400',
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Invalid state
        'aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-500/20',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
