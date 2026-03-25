import { ContextMenu as BaseContextMenu } from '@base-ui-components/react/context-menu';
import { Menu } from '@base-ui-components/react/menu';
import React, { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- Root / Group / RadioGroup / Sub ---
export const ContextMenu = BaseContextMenu.Root;
export const ContextMenuGroup = Menu.Group;
export const ContextMenuRadioGroup = Menu.RadioGroup;
export const ContextMenuSub = Menu.SubmenuRoot;

// --- ContextMenuTrigger ---
export interface ContextMenuTriggerProps extends React.ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
  children?: React.ReactNode;
}

export const ContextMenuTrigger = forwardRef<HTMLElement, ContextMenuTriggerProps>(
  ({ asChild, children, className, tabIndex = 0, onKeyDown, ...props }, ref) => {
    // Allow keyboard users to open the context menu via the ContextMenu key or Shift+F10.
    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      if (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) {
        event.preventDefault();
        const target = event.currentTarget;
        const rect = target.getBoundingClientRect();
        target.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
          }),
        );
      }
      onKeyDown?.(event);
    }

    if (asChild && React.isValidElement(children)) {
      return (
        <BaseContextMenu.Trigger
          ref={ref as React.Ref<HTMLDivElement>}
          className={cn('hui-context-menu__trigger', className)}
          render={children as React.ReactElement<Record<string, unknown>>}
          tabIndex={tabIndex}
          onKeyDown={handleKeyDown}
          {...props}
        />
      );
    }
    return (
      <BaseContextMenu.Trigger
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn('hui-context-menu__trigger', className)}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </BaseContextMenu.Trigger>
    );
  },
);
ContextMenuTrigger.displayName = 'ContextMenuTrigger';

// --- ContextMenuContent ---
export interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}

export const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <Menu.Portal>
      <Menu.Positioner sideOffset={sideOffset}>
        <Menu.Popup ref={ref} className={cn('hui-context-menu__content', className)} {...props} />
      </Menu.Positioner>
    </Menu.Portal>
  ),
);
ContextMenuContent.displayName = 'ContextMenuContent';

// --- ContextMenuItem ---
export interface ContextMenuItemProps extends React.HTMLAttributes<HTMLElement> {
  inset?: boolean;
  disabled?: boolean;
}

export const ContextMenuItem = forwardRef<HTMLElement, ContextMenuItemProps>(
  ({ className, inset, ...props }, ref) => (
    <Menu.Item
      ref={ref}
      className={cn('hui-context-menu__item', inset && 'hui-context-menu__item--inset', className)}
      {...props}
    />
  ),
);
ContextMenuItem.displayName = 'ContextMenuItem';

// --- ContextMenuCheckboxItem ---
export interface ContextMenuCheckboxItemProps extends React.HTMLAttributes<HTMLElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ContextMenuCheckboxItem = forwardRef<HTMLElement, ContextMenuCheckboxItemProps>(
  ({ className, children, checked, defaultChecked, onCheckedChange, ...props }, ref) => (
    <Menu.CheckboxItem
      ref={ref}
      className={cn('hui-context-menu__checkbox-item', className)}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      <Menu.CheckboxItemIndicator className="hui-context-menu__item-indicator">
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
ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem';

// --- ContextMenuRadioItem ---
export interface ContextMenuRadioItemProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ContextMenuRadioItem = forwardRef<HTMLElement, ContextMenuRadioItemProps>(
  ({ className, children, value, ...props }, ref) => (
    <Menu.RadioItem
      ref={ref}
      className={cn('hui-context-menu__radio-item', className)}
      value={value}
      {...props}
    >
      <Menu.RadioItemIndicator className="hui-context-menu__item-indicator">
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
ContextMenuRadioItem.displayName = 'ContextMenuRadioItem';

// --- ContextMenuLabel ---
export interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export const ContextMenuLabel = forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <Menu.GroupLabel
      ref={ref}
      className={cn('hui-context-menu__label', inset && 'hui-context-menu__item--inset', className)}
      {...props}
    />
  ),
);
ContextMenuLabel.displayName = 'ContextMenuLabel';

// --- ContextMenuSeparator ---
export interface ContextMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ContextMenuSeparator = forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <Menu.Separator ref={ref} className={cn('hui-context-menu__separator', className)} {...props} />
  ),
);
ContextMenuSeparator.displayName = 'ContextMenuSeparator';

// --- ContextMenuSubTrigger ---
export interface ContextMenuSubTriggerProps extends React.HTMLAttributes<HTMLElement> {
  inset?: boolean;
  children?: React.ReactNode;
}

export const ContextMenuSubTrigger = forwardRef<HTMLElement, ContextMenuSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => (
    <Menu.SubmenuTrigger
      ref={ref}
      className={cn(
        'hui-context-menu__sub-trigger',
        inset && 'hui-context-menu__item--inset',
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
        className="hui-context-menu__chevron"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Menu.SubmenuTrigger>
  ),
);
ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';

// --- ContextMenuSubContent ---
export interface ContextMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}

export const ContextMenuSubContent = forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <Menu.Portal>
      <Menu.Positioner sideOffset={sideOffset} side="right">
        <Menu.Popup
          ref={ref}
          className={cn('hui-context-menu__sub-content', className)}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  ),
);
ContextMenuSubContent.displayName = 'ContextMenuSubContent';

// --- ContextMenuShortcut ---
export interface ContextMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const ContextMenuShortcut = forwardRef<HTMLSpanElement, ContextMenuShortcutProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('hui-context-menu__shortcut', className)} {...props} />
  ),
);
ContextMenuShortcut.displayName = 'ContextMenuShortcut';
