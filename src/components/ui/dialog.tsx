'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export type DialogOverlayProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;

export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

export type DialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;

export function DialogContent({ className, children, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-800 bg-slate-900/95 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-3xl',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-slate-400 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-slate-800 focus:outline-none disabled:pointer-events-none cursor-pointer">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export type DialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />;
}

export type DialogFooterProps = HTMLAttributes<HTMLDivElement>;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />;
}

export type DialogTitleProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold leading-none tracking-tight text-white', className)}
      {...props}
    />
  );
}

export type DialogDescriptionProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <DialogPrimitive.Description className={cn('text-sm text-slate-400', className)} {...props} />;
}
