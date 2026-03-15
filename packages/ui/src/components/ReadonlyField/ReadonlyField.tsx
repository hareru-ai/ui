import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface ReadonlyFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
}

export const ReadonlyField = forwardRef<HTMLDivElement, ReadonlyFieldProps>(
  ({ className, label, value, ...props }, ref) => (
    <div ref={ref} className={cn('hui-readonly-field', className)} {...props}>
      <span className="hui-readonly-field__label">{label}</span>
      <span className="hui-readonly-field__value">{value}</span>
    </div>
  ),
);
ReadonlyField.displayName = 'ReadonlyField';
