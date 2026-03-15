import { AlertDialog as BaseAlertDialog } from '@base-ui-components/react/alert-dialog';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- AlertDialog (root) ---
export const AlertDialog = BaseAlertDialog.Root;

// --- AlertDialogTrigger ---
export const AlertDialogTrigger = BaseAlertDialog.Trigger;

// --- AlertDialogOverlay ---
export interface AlertDialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

const AlertDialogOverlay = forwardRef<HTMLDivElement, AlertDialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <BaseAlertDialog.Backdrop
      ref={ref}
      className={cn('hui-alert-dialog__overlay', className)}
      {...props}
    />
  ),
);
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

// --- AlertDialogContent ---
export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <BaseAlertDialog.Portal>
      <AlertDialogOverlay />
      <BaseAlertDialog.Popup
        ref={ref}
        className={cn('hui-alert-dialog__content', className)}
        {...props}
      >
        {children}
      </BaseAlertDialog.Popup>
    </BaseAlertDialog.Portal>
  ),
);
AlertDialogContent.displayName = 'AlertDialogContent';

// --- AlertDialogHeader ---
export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogHeader = forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-alert-dialog__header', className)} {...props} />
  ),
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

// --- AlertDialogFooter ---
export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-alert-dialog__footer', className)} {...props} />
  ),
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

// --- AlertDialogTitle ---
export interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ className, ...props }, ref) => (
    <BaseAlertDialog.Title
      ref={ref}
      className={cn('hui-alert-dialog__title', className)}
      {...props}
    />
  ),
);
AlertDialogTitle.displayName = 'AlertDialogTitle';

// --- AlertDialogDescription ---
export interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDialogDescription = forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <BaseAlertDialog.Description
      ref={ref}
      className={cn('hui-alert-dialog__description', className)}
      {...props}
    />
  ),
);
AlertDialogDescription.displayName = 'AlertDialogDescription';

// --- AlertDialogAction ---
export interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ className, ...props }, ref) => (
    <BaseAlertDialog.Close
      ref={ref}
      className={cn('hui-alert-dialog__action', className)}
      {...props}
    />
  ),
);
AlertDialogAction.displayName = 'AlertDialogAction';

// --- AlertDialogCancel ---
export interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ className, ...props }, ref) => (
    <BaseAlertDialog.Close
      ref={ref}
      className={cn('hui-alert-dialog__cancel', className)}
      {...props}
    />
  ),
);
AlertDialogCancel.displayName = 'AlertDialogCancel';
