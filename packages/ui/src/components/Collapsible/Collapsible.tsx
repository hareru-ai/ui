import { Collapsible as BaseCollapsible } from '@base-ui-components/react/collapsible';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- CollapsibleTrigger ---
export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, ...props }, ref) => (
    <BaseCollapsible.Trigger
      ref={ref}
      className={cn('hui-collapsible__trigger', className)}
      {...props}
    />
  ),
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

// --- CollapsibleContent ---
export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, ...props }, ref) => (
    <BaseCollapsible.Panel
      ref={ref}
      keepMounted
      className={cn('hui-collapsible__content', className)}
      {...props}
    />
  ),
);
CollapsibleContent.displayName = 'CollapsibleContent';

// --- Collapsible ---
export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, onOpenChange, ...props }, ref) => (
    <BaseCollapsible.Root
      ref={ref}
      className={cn('hui-collapsible', className)}
      onOpenChange={onOpenChange ? (value) => onOpenChange(value) : undefined}
      {...props}
    />
  ),
);
Collapsible.displayName = 'Collapsible';
