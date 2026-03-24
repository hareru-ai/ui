import { type VariantProps, cva } from 'class-variance-authority';
import { type ReactNode, forwardRef, isValidElement } from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

/** When disabled + asChild, extract text from child element to avoid nested anchors. */
function resolveChildren(
  children: ReactNode,
  disabled: boolean | undefined,
  asChild: boolean,
): ReactNode {
  if (disabled && asChild && isValidElement(children)) {
    return (children.props as Record<string, unknown>).children as ReactNode;
  }
  return children;
}

// --- Pagination ---
export interface PaginationProps extends React.ComponentPropsWithoutRef<'nav'> {}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} aria-label="Pagination" className={cn('hui-pagination', className)} {...props} />
  ),
);
Pagination.displayName = 'Pagination';

// --- PaginationContent ---
export interface PaginationContentProps extends React.ComponentPropsWithoutRef<'ul'> {}

export const PaginationContent = forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('hui-pagination__content', className)} {...props} />
  ),
);
PaginationContent.displayName = 'PaginationContent';

// --- PaginationItem ---
export interface PaginationItemProps extends React.ComponentPropsWithoutRef<'li'> {}

export const PaginationItem = forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('hui-pagination__item', className)} {...props} />
  ),
);
PaginationItem.displayName = 'PaginationItem';

// --- PaginationLink ---
const paginationLinkVariants = cva('hui-pagination__link', {
  variants: {
    size: {
      sm: 'hui-pagination__link--sm',
      md: 'hui-pagination__link--md',
      lg: 'hui-pagination__link--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface PaginationLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof paginationLinkVariants> {
  asChild?: boolean;
  isActive?: boolean;
}

export const PaginationLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ asChild = false, isActive, size, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';
    return (
      <Comp
        ref={ref}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          paginationLinkVariants({ size }),
          isActive && 'hui-pagination__link--active',
          className,
        )}
        {...props}
      />
    );
  },
);
PaginationLink.displayName = 'PaginationLink';

// --- PaginationPrevious ---
export interface PaginationPreviousProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  disabled?: boolean;
}

export const PaginationPrevious = forwardRef<HTMLAnchorElement, PaginationPreviousProps>(
  ({ asChild = false, disabled, className, href, onClick, children, ...props }, ref) => {
    // When disabled, render as <span> to avoid nested <a> tags when asChild passes a Link/anchor
    const Comp = disabled ? 'span' : asChild ? Slot : 'a';
    return (
      <Comp
        ref={ref}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        data-disabled={disabled || undefined}
        onClick={disabled ? (e: React.MouseEvent) => e.preventDefault() : onClick}
        className={cn(
          'hui-pagination__link',
          'hui-pagination__link--previous',
          disabled && 'hui-pagination__link--disabled',
          className,
        )}
        {...props}
      >
        {resolveChildren(children, disabled, asChild)}
      </Comp>
    );
  },
);
PaginationPrevious.displayName = 'PaginationPrevious';

// --- PaginationNext ---
export interface PaginationNextProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  disabled?: boolean;
}

export const PaginationNext = forwardRef<HTMLAnchorElement, PaginationNextProps>(
  ({ asChild = false, disabled, className, href, onClick, children, ...props }, ref) => {
    // When disabled, render as <span> to avoid nested <a> tags when asChild passes a Link/anchor
    const Comp = disabled ? 'span' : asChild ? Slot : 'a';
    return (
      <Comp
        ref={ref}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        data-disabled={disabled || undefined}
        onClick={disabled ? (e: React.MouseEvent) => e.preventDefault() : onClick}
        className={cn(
          'hui-pagination__link',
          'hui-pagination__link--next',
          disabled && 'hui-pagination__link--disabled',
          className,
        )}
        {...props}
      >
        {resolveChildren(children, disabled, asChild)}
      </Comp>
    );
  },
);
PaginationNext.displayName = 'PaginationNext';

// --- PaginationEllipsis ---
export interface PaginationEllipsisProps extends React.ComponentPropsWithoutRef<'span'> {}

export const PaginationEllipsis = forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-label="More pages"
      className={cn('hui-pagination__ellipsis', className)}
      {...props}
    >
      <span aria-hidden="true">&hellip;</span>
    </span>
  ),
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export { paginationLinkVariants };
