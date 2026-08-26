import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500 shadow-indigo-500/20',
        destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600 shadow-red-500/20',
        outline: 'border border-slate-700 bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 hover:text-white',
        secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white',
        ghost: 'hover:bg-slate-800/80 text-slate-300 hover:text-white',
        link: 'text-indigo-400 underline-offset-4 hover:underline',
        gradient:
          'bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
