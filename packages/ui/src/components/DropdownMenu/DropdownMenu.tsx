import { Menu } from '@base-ui-components/react/menu';
import React, { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- Root / Trigger / Group / Portal ---
export const DropdownMenu = Menu.Root;
export const DropdownMenuGroup = Menu.Group;
export const DropdownMenuPortal = Menu.Portal;
export const DropdownMenuSub = Menu.SubmenuRoot;
export const DropdownMenuRadioGroup = Menu.RadioGroup;

// --- DropdownMenuTrigger ---
export interface DropdownMenuTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
  children?: React.ReactNode;
}

export const DropdownMenuTrigger = forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return (
        <Menu.Trigger
          ref={ref}
          render={children as React.ReactElement<Record<string, unknown>>}
          {...props}
        />
      );
    }
    return (
      <Menu.Trigger ref={ref} {...props}>
        {children}
      </Menu.Trigger>
    );
  },
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

// --- DropdownMenuSubTrigger ---
export interface DropdownMenuSubTriggerProps extends React.HTMLAttributes<HTMLElement> {
  inset?: boolean;
  children?: React.ReactNode;
}

export const DropdownMenuSubTrigger = forwardRef<HTMLElement, DropdownMenuSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => (
    <Menu.SubmenuTrigger
      ref={ref}
      className={cn(
        'hui-dropdown-menu__sub-trigger',
        inset && 'hui-dropdown-menu__item--inset',
        className,
      )}
      {...props}
    >
      {children}
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
        className="hui-dropdown-menu__chevron"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Menu.SubmenuTrigger>
  ),
);
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

// --- DropdownMenuSubContent ---
export interface DropdownMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}

export const DropdownMenuSubContent = forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <Menu.Portal>
      <Menu.Positioner sideOffset={sideOffset} side="right">
        <Menu.Popup
          ref={ref}
          className={cn('hui-dropdown-menu__sub-content', className)}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  ),
);
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

// --- DropdownMenuContent ---
export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <Menu.Portal>
      <Menu.Positioner sideOffset={sideOffset}>
        <Menu.Popup ref={ref} className={cn('hui-dropdown-menu__content', className)} {...props} />
      </Menu.Positioner>
    </Menu.Portal>
  ),
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

// --- DropdownMenuItem ---
export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLElement> {
  inset?: boolean;
  disabled?: boolean;
}

export const DropdownMenuItem = forwardRef<HTMLElement, DropdownMenuItemProps>(
  ({ className, inset, ...props }, ref) => (
    <Menu.Item
      ref={ref}
      className={cn(
        'hui-dropdown-menu__item',
        inset && 'hui-dropdown-menu__item--inset',
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

// --- DropdownMenuCheckboxItem ---
export interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const DropdownMenuCheckboxItem = forwardRef<HTMLElement, DropdownMenuCheckboxItemProps>(
  ({ className, children, checked, defaultChecked, onCheckedChange, ...props }, ref) => (
    <Menu.CheckboxItem
      ref={ref}
      className={cn('hui-dropdown-menu__checkbox-item', className)}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      <Menu.CheckboxItemIndicator className="hui-dropdown-menu__item-indicator">
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
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </Menu.CheckboxItemIndicator>
      {children}
    </Menu.CheckboxItem>
  ),
);
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

// --- DropdownMenuRadioItem ---
export interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const DropdownMenuRadioItem = forwardRef<HTMLElement, DropdownMenuRadioItemProps>(
  ({ className, children, value, ...props }, ref) => (
    <Menu.RadioItem
      ref={ref}
      className={cn('hui-dropdown-menu__radio-item', className)}
      value={value}
      {...props}
    >
      <Menu.RadioItemIndicator className="hui-dropdown-menu__item-indicator">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="4" cy="4" r="4" />
        </svg>
      </Menu.RadioItemIndicator>
      {children}
    </Menu.RadioItem>
  ),
);
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

// --- DropdownMenuLabel ---
export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <Menu.GroupLabel
      ref={ref}
      className={cn(
        'hui-dropdown-menu__label',
        inset && 'hui-dropdown-menu__item--inset',
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// --- DropdownMenuSeparator ---
export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <Menu.Separator
      ref={ref}
      className={cn('hui-dropdown-menu__separator', className)}
      {...props}
    />
  ),
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// --- DropdownMenuShortcut ---
export interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const DropdownMenuShortcut = forwardRef<HTMLSpanElement, DropdownMenuShortcutProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('hui-dropdown-menu__shortcut', className)} {...props} />
  ),
);
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';
