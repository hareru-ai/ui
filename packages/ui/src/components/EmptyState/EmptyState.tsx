import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- EmptyState ---
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-empty-state', className)} role="status" {...props} />
  ),
);
EmptyState.displayName = 'EmptyState';

// --- EmptyStateIcon ---
export interface EmptyStateIconProps extends React.HTMLAttributes<HTMLDivElement> {}

export const EmptyStateIcon = forwardRef<HTMLDivElement, EmptyStateIconProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('hui-empty-state__icon', className)}
      aria-hidden="true"
      {...props}
    />
  ),
);
EmptyStateIcon.displayName = 'EmptyStateIcon';

// --- EmptyStateTitle ---
export interface EmptyStateTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const EmptyStateTitle = forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('hui-empty-state__title', className)} {...props} />
  ),
);
EmptyStateTitle.displayName = 'EmptyStateTitle';

// --- EmptyStateDescription ---
export interface EmptyStateDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const EmptyStateDescription = forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('hui-empty-state__description', className)} {...props} />
  ),
);
EmptyStateDescription.displayName = 'EmptyStateDescription';

// --- EmptyStateAction ---
export interface EmptyStateActionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const EmptyStateAction = forwardRef<HTMLDivElement, EmptyStateActionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-empty-state__action', className)} {...props} />
  ),
);
EmptyStateAction.displayName = 'EmptyStateAction';
