import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('hui-separator', `hui-separator--${orientation}`, className)}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      {...props}
    />
  ),
);
Separator.displayName = 'Separator';
