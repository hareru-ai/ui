import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { ReadonlyField } from '../ReadonlyField';

export interface KeyValueItem {
  label: string;
  value: ReactNode;
}

export interface KeyValueListProps extends HTMLAttributes<HTMLDivElement> {
  items: KeyValueItem[];
}

export const KeyValueList = forwardRef<HTMLDivElement, KeyValueListProps>(
  ({ className, items, ...props }, ref) => (
    <div ref={ref} className={cn('hui-key-value-list', className)} {...props}>
      {items.map((item) => (
        <ReadonlyField key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  ),
);
KeyValueList.displayName = 'KeyValueList';
