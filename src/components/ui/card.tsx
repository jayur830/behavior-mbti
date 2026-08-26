import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl text-slate-100 shadow-xl',
        className,
      )}
      {...props}
    />
  );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn('font-semibold leading-none tracking-tight text-white', className)} {...props} />;
}

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn('text-sm text-slate-400', className)} {...props} />;
}

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}
