import { NavigationMenu as NavMenu } from '@base-ui-components/react/navigation-menu';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- NavigationMenu (root) ---
export interface NavigationMenuProps extends React.ComponentPropsWithoutRef<'nav'> {
  value?: NavMenu.Root.Props['value'];
  defaultValue?: NavMenu.Root.Props['defaultValue'];
  onValueChange?: NavMenu.Root.Props['onValueChange'];
  delay?: NavMenu.Root.Props['delay'];
  closeDelay?: NavMenu.Root.Props['closeDelay'];
  orientation?: NavMenu.Root.Props['orientation'];
}

export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onValueChange,
      delay = 0,
      closeDelay = 0,
      orientation,
      ...props
    },
    ref,
  ) => (
    <NavMenu.Root
      ref={ref}
      className={cn('hui-navigation-menu', className)}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      delay={delay}
      closeDelay={closeDelay}
      orientation={orientation}
      {...props}
    >
      {children}
      <NavMenu.Portal>
        <NavMenu.Backdrop className="hui-navigation-menu__backdrop" />
        <NavMenu.Positioner className="hui-navigation-menu__positioner" sideOffset={8}>
          <NavMenu.Popup className="hui-navigation-menu__popup">
            <NavMenu.Viewport className="hui-navigation-menu__viewport" />
          </NavMenu.Popup>
        </NavMenu.Positioner>
      </NavMenu.Portal>
    </NavMenu.Root>
  ),
);
NavigationMenu.displayName = 'NavigationMenu';

// --- NavigationMenuList ---
export interface NavigationMenuListProps extends React.ComponentPropsWithoutRef<'ul'> {}

export const NavigationMenuList = forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ className, ...props }, ref) => (
    <NavMenu.List
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn('hui-navigation-menu__list', className)}
      {...props}
    />
  ),
);
NavigationMenuList.displayName = 'NavigationMenuList';

// --- NavigationMenuItem ---
export interface NavigationMenuItemProps extends React.ComponentPropsWithoutRef<'li'> {
  value?: NavMenu.Item.Props['value'];
}

export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ value, ...props }, ref) => (
    <NavMenu.Item ref={ref as React.Ref<HTMLDivElement>} value={value} {...props} />
  ),
);
NavigationMenuItem.displayName = 'NavigationMenuItem';

// --- NavigationMenuTrigger ---
export interface NavigationMenuTriggerProps extends React.ComponentPropsWithoutRef<'button'> {}

export const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <NavMenu.Trigger ref={ref} className={cn('hui-navigation-menu__trigger', className)} {...props}>
      {children}
      <NavMenu.Icon className="hui-navigation-menu__chevron">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </NavMenu.Icon>
    </NavMenu.Trigger>
  ),
);
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger';

// --- NavigationMenuContent ---
export interface NavigationMenuContentProps extends React.ComponentPropsWithoutRef<'div'> {}

export const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ className, ...props }, ref) => (
    <NavMenu.Content
      ref={ref}
      className={cn('hui-navigation-menu__content', className)}
      {...props}
    />
  ),
);
NavigationMenuContent.displayName = 'NavigationMenuContent';

// --- NavigationMenuLink ---
export interface NavigationMenuLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  active?: NavMenu.Link.Props['active'];
  closeOnClick?: NavMenu.Link.Props['closeOnClick'];
}

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, active, closeOnClick, ...props }, ref) => (
    <NavMenu.Link
      ref={ref}
      className={cn('hui-navigation-menu__link', className)}
      active={active}
      closeOnClick={closeOnClick}
      {...props}
    />
  ),
);
NavigationMenuLink.displayName = 'NavigationMenuLink';

// --- NavigationMenuIndicator (custom) ---
export interface NavigationMenuIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavigationMenuIndicator = forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-navigation-menu__indicator', className)} {...props}>
      <div className="hui-navigation-menu__indicator-arrow" />
    </div>
  ),
);
NavigationMenuIndicator.displayName = 'NavigationMenuIndicator';

// --- NavigationMenuViewport (standalone, for custom usage) ---
export interface NavigationMenuViewportProps extends React.ComponentPropsWithoutRef<'div'> {}

export const NavigationMenuViewport = forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  ({ className, ...props }, ref) => (
    <NavMenu.Viewport
      ref={ref}
      className={cn('hui-navigation-menu__viewport', className)}
      {...props}
    />
  ),
);
NavigationMenuViewport.displayName = 'NavigationMenuViewport';
