import { Toast as ToastPrimitive } from '@base-ui-components/react/toast';
import { type VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- ToastProvider ---
export const ToastProvider = ToastPrimitive.Provider;

// --- ToastViewport ---
export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
      ref={ref}
      className={cn('hui-toast__viewport', className)}
      {...props}
    />
  ),
);
ToastViewport.displayName = 'ToastViewport';

// --- Toast (root) ---
const toastVariants = cva('hui-toast', {
  variants: {
    variant: {
      default: 'hui-toast--default',
      destructive: 'hui-toast--destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type SyntheticToastObject = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: string;
};

export interface ToastProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof toastVariants> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  toast?: SyntheticToastObject;
}

const STATIC_TOAST: SyntheticToastObject = { id: '__static__' };

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, toast, open: _open, onOpenChange: _onOpenChange, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      toast={toast ?? STATIC_TOAST}
      className={cn(toastVariants({ variant, className }))}
      {...props}
    />
  ),
);
Toast.displayName = 'Toast';

// --- ToastTitle ---
export interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const ToastTitle = forwardRef<HTMLHeadingElement, ToastTitleProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Title ref={ref} className={cn('hui-toast__title', className)} {...props} />
  ),
);
ToastTitle.displayName = 'ToastTitle';

// --- ToastDescription ---
export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const ToastDescription = forwardRef<HTMLParagraphElement, ToastDescriptionProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Description
      ref={ref}
      className={cn('hui-toast__description', className)}
      {...props}
    />
  ),
);
ToastDescription.displayName = 'ToastDescription';

// --- ToastAction ---
export interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  altText?: string;
}

export const ToastAction = forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, altText: _altText, ...props }, ref) => (
    <ToastPrimitive.Action ref={ref} className={cn('hui-toast__action', className)} {...props} />
  ),
);
ToastAction.displayName = 'ToastAction';

// --- ToastClose ---
export interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Close ref={ref} className={cn('hui-toast__close', className)} {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </ToastPrimitive.Close>
  ),
);
ToastClose.displayName = 'ToastClose';

// --- Export types ---
export type ToastActionElement = React.ReactElement<typeof ToastAction>;
export { toastVariants };
