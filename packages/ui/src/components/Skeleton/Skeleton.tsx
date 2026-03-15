import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-skeleton', className)} aria-hidden="true" {...props} />
  ),
);
Skeleton.displayName = 'Skeleton';
