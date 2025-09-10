import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        default: 
          'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500 ' +
          'dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-blue-400 ' +
          'border border-blue-600 hover:border-blue-700 dark:border-blue-500 dark:hover:border-blue-600',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 ' +
          'dark:bg-red-500 dark:hover:bg-red-600 dark:focus-visible:ring-red-400 ' +
          'border border-red-600 hover:border-red-700 dark:border-red-500 dark:hover:border-red-600',
        outline:
          'border-2 border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-blue-500 ' +
          'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:focus-visible:ring-blue-400',
        secondary: 
          'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:ring-gray-500 ' +
          'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus-visible:ring-gray-400 ' +
          'border border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
        ghost: 
          'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500 ' +
          'dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus-visible:ring-gray-400',
        link: 
          'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500 ' +
          'dark:text-blue-400 dark:focus-visible:ring-blue-400',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
