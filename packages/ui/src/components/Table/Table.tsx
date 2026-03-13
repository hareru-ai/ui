import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="hui-table__wrapper">
      <table ref={ref} className={cn('hui-table', className)} {...props} />
    </div>
  ),
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('hui-table__header', className)} {...props} />
  ),
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('hui-table__body', className)} {...props} />
  ),
);
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('hui-table__row', className)} {...props} />
  ),
);
TableRow.displayName = 'TableRow';

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align, ...props }, ref) => (
    <th
      ref={ref}
      className={cn('hui-table__head', align && `hui-table__head--${align}`, className)}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('hui-table__cell', align && `hui-table__cell--${align}`, className)}
      {...props}
    />
  ),
);
TableCell.displayName = 'TableCell';
