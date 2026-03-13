import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { type VariantProps, cva } from 'class-variance-authority';
import { type ReactElement, forwardRef, isValidElement } from 'react';
import { cn } from '../../lib/cn';

// --- Sheet (root) ---
export const Sheet = BaseDialog.Root;

// --- SheetTrigger ---
export interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const SheetTrigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(
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
SheetTrigger.displayName = 'SheetTrigger';

// --- SheetClose ---
export interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const SheetClose = forwardRef<HTMLButtonElement, SheetCloseProps>(
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
SheetClose.displayName = 'SheetClose';

// --- SheetOverlay ---
export interface SheetOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

const SheetOverlay = forwardRef<HTMLDivElement, SheetOverlayProps>(
  ({ className, ...props }, ref) => (
    <BaseDialog.Backdrop ref={ref} className={cn('hui-sheet__overlay', className)} {...props} />
  ),
);
SheetOverlay.displayName = 'SheetOverlay';

// --- SheetContent ---
const sheetContentVariants = cva('hui-sheet__content', {
  variants: {
    side: {
      top: 'hui-sheet__content--top',
      bottom: 'hui-sheet__content--bottom',
      left: 'hui-sheet__content--left',
      right: 'hui-sheet__content--right',
    },
  },
  defaultVariants: {
    side: 'right',
  },
});

export interface SheetContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sheetContentVariants> {
  closeLabel?: string;
}

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = 'right', closeLabel = 'Close', children, ...props }, ref) => (
    <BaseDialog.Portal>
      <SheetOverlay />
      <BaseDialog.Popup
        ref={ref}
        className={cn(sheetContentVariants({ side }), className)}
        {...props}
      >
        {children}
        <BaseDialog.Close className="hui-sheet__close" aria-label={closeLabel}>
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
SheetContent.displayName = 'SheetContent';

// --- SheetHeader ---
export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SheetHeader = forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-sheet__header', className)} {...props} />
  ),
);
SheetHeader.displayName = 'SheetHeader';

// --- SheetFooter ---
export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SheetFooter = forwardRef<HTMLDivElement, SheetFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-sheet__footer', className)} {...props} />
  ),
);
SheetFooter.displayName = 'SheetFooter';

// --- SheetTitle ---
export interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const SheetTitle = forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...props }, ref) => (
    <BaseDialog.Title ref={ref} className={cn('hui-sheet__title', className)} {...props} />
  ),
);
SheetTitle.displayName = 'SheetTitle';

// --- SheetDescription ---
export interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const SheetDescription = forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ className, ...props }, ref) => (
    <BaseDialog.Description
      ref={ref}
      className={cn('hui-sheet__description', className)}
      {...props}
    />
  ),
);
SheetDescription.displayName = 'SheetDescription';

export { sheetContentVariants };
