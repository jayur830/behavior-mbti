import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-indigo-600 text-white shadow hover:bg-indigo-500',
        secondary: 'border-transparent bg-slate-800 text-slate-200 hover:bg-slate-700',
        destructive: 'border-transparent bg-red-500/20 text-red-400 border-red-500/30',
        outline: 'border-slate-700/80 text-slate-300',
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
