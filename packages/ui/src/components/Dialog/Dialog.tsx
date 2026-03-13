import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { type ReactElement, forwardRef, isValidElement } from 'react';
import { cn } from '../../lib/cn';

// --- Dialog (root) ---
export const Dialog = BaseDialog.Root;

// --- DialogTrigger ---
export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && isValidElement(children)) {
      return (
        <BaseDialog.Trigger
          ref={ref}
          render={children as ReactElement<Record<string, unknown>>}
          {...props}
        />
      );
    }
    return (
      <BaseDialog.Trigger ref={ref} {...props}>
        {children}
      </BaseDialog.Trigger>
    );
  },
);
DialogTrigger.displayName = 'DialogTrigger';

// --- DialogClose ---
export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && isValidElement(children)) {
      return (
        <BaseDialog.Close
          ref={ref}
          render={children as ReactElement<Record<string, unknown>>}
          {...props}
        />
      );
    }
    return (
      <BaseDialog.Close ref={ref} {...props}>
        {children}
      </BaseDialog.Close>
    );
  },
);
DialogClose.displayName = 'DialogClose';

// --- DialogOverlay ---
export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <BaseDialog.Backdrop ref={ref} className={cn('hui-dialog__overlay', className)} {...props} />
  ),
);
DialogOverlay.displayName = 'DialogOverlay';

// --- DialogContent ---
export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <BaseDialog.Portal>
      <DialogOverlay />
      <BaseDialog.Popup ref={ref} className={cn('hui-dialog__content', className)} {...props}>
        {children}
        <BaseDialog.Close className="hui-dialog__close" aria-label="Close">
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
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  ),
);
DialogContent.displayName = 'DialogContent';

// --- DialogHeader ---
export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-dialog__header', className)} {...props} />
  ),
);
DialogHeader.displayName = 'DialogHeader';

// --- DialogFooter ---
export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-dialog__footer', className)} {...props} />
  ),
);
DialogFooter.displayName = 'DialogFooter';

// --- DialogTitle ---
export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <BaseDialog.Title ref={ref} className={cn('hui-dialog__title', className)} {...props} />
  ),
);
DialogTitle.displayName = 'DialogTitle';

// --- DialogDescription ---
export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <BaseDialog.Description
      ref={ref}
      className={cn('hui-dialog__description', className)}
      {...props}
    />
  ),
);
DialogDescription.displayName = 'DialogDescription';
