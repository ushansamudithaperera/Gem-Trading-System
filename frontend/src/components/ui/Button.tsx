import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800',
        destructive: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/15 hover:shadow-lg hover:shadow-rose-500/25 hover:from-rose-600 hover:to-red-700',
        outline: 'border border-slate-200/80 bg-white/80 backdrop-blur-sm text-slate-700 ring-1 ring-inset ring-slate-200/60 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:shadow-md hover:ring-slate-300/60',
        secondary: 'bg-slate-100/80 text-slate-900 shadow-sm hover:bg-slate-200/80 hover:shadow-md',
        ghost: 'hover:bg-slate-100/80 text-slate-700 hover:text-slate-900',
        link: 'text-blue-700 underline-offset-4 hover:underline hover:text-blue-800',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };