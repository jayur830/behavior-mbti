import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-foreground text-background shadow hover:opacity-85',
        secondary: 'border-transparent bg-muted text-foreground hover:bg-muted/80',
        destructive: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
        outline: 'border-border bg-muted/60 dark:bg-muted/80 text-foreground font-medium',
        indigo: 'bg-lime-300/15 border-lime-600/30 text-lime-800 dark:text-lime-300',
        purple: 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export default function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
