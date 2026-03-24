import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

// --- Breadcrumb ---
export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} aria-label="Breadcrumb" className={cn('hui-breadcrumb', className)} {...props} />
  ),
);
Breadcrumb.displayName = 'Breadcrumb';

// --- BreadcrumbList ---
export interface BreadcrumbListProps extends React.ComponentPropsWithoutRef<'ol'> {}

export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn('hui-breadcrumb__list', className)} {...props} />
  ),
);
BreadcrumbList.displayName = 'BreadcrumbList';

// --- BreadcrumbItem ---
export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<'li'> {}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('hui-breadcrumb__item', className)} {...props} />
  ),
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

// --- BreadcrumbLink ---
export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';
    return <Comp ref={ref} className={cn('hui-breadcrumb__link', className)} {...props} />;
  },
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

// --- BreadcrumbPage ---
export interface BreadcrumbPageProps extends React.ComponentPropsWithoutRef<'span'> {}

export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={cn('hui-breadcrumb__page', className)}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

// --- BreadcrumbSeparator ---
export interface BreadcrumbSeparatorProps extends React.ComponentPropsWithoutRef<'li'> {}

export const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn('hui-breadcrumb__separator', className)}
      {...props}
    >
      {children ?? '/'}
    </li>
  ),
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// --- BreadcrumbEllipsis ---
export interface BreadcrumbEllipsisProps extends React.ComponentPropsWithoutRef<'span'> {}

export const BreadcrumbEllipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-label="More"
      className={cn('hui-breadcrumb__ellipsis', className)}
      {...props}
    >
      <span aria-hidden="true">&hellip;</span>
    </span>
  ),
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';
