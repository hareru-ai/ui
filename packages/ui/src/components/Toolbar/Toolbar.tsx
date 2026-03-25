import { Toolbar as BaseToolbar } from '@base-ui-components/react/toolbar';
import { type VariantProps, cva } from 'class-variance-authority';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- CVA variants for ToolbarButton ---
const toolbarButtonVariants = cva('hui-toolbar__button', {
  variants: {
    variant: {
      default: 'hui-toolbar__button--default',
      outline: 'hui-toolbar__button--outline',
    },
    size: {
      sm: 'hui-toolbar__button--sm',
      md: 'hui-toolbar__button--md',
      lg: 'hui-toolbar__button--lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

// --- Toolbar ---
export interface ToolbarProps extends React.ComponentPropsWithoutRef<'div'> {
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  loopFocus?: boolean;
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, disabled, orientation = 'horizontal', loopFocus, ...props }, ref) => (
    <BaseToolbar.Root
      ref={ref}
      className={cn('hui-toolbar', className)}
      disabled={disabled}
      orientation={orientation}
      loopFocus={loopFocus}
      {...props}
    />
  ),
);
Toolbar.displayName = 'Toolbar';

// --- ToolbarButton ---
export interface ToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toolbarButtonVariants> {
  disabled?: boolean;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <BaseToolbar.Button
      ref={ref}
      className={cn(toolbarButtonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
ToolbarButton.displayName = 'ToolbarButton';

// --- ToolbarGroup ---
export interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ className, ...props }, ref) => (
    <BaseToolbar.Group ref={ref} className={cn('hui-toolbar__group', className)} {...props} />
  ),
);
ToolbarGroup.displayName = 'ToolbarGroup';

// --- ToolbarSeparator ---
export interface ToolbarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  ({ className, ...props }, ref) => (
    <BaseToolbar.Separator
      ref={ref}
      className={cn('hui-toolbar__separator', className)}
      {...props}
    />
  ),
);
ToolbarSeparator.displayName = 'ToolbarSeparator';

// --- ToolbarLink ---
export interface ToolbarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export const ToolbarLink = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(
  ({ className, ...props }, ref) => (
    <BaseToolbar.Link ref={ref} className={cn('hui-toolbar__link', className)} {...props} />
  ),
);
ToolbarLink.displayName = 'ToolbarLink';

export { toolbarButtonVariants };
