import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

function getProgressState(value: number | null | undefined, max: number): string {
  if (value == null) return 'indeterminate';
  if (value >= max) return 'complete';
  return 'loading';
}

// --- ProgressIndicator ---
export interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ProgressIndicator = forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-progress__indicator', className)} {...props} />
  ),
);
ProgressIndicator.displayName = 'ProgressIndicator';

// --- Progress ---
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null;
  max?: number;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const state = getProgressState(value, max);
    return (
      <div
        ref={ref}
        role="progressbar"
        tabIndex={-1}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value != null ? value : undefined}
        data-state={state}
        className={cn('hui-progress', className)}
        {...props}
      >
        <ProgressIndicator style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }} />
      </div>
    );
  },
);
Progress.displayName = 'Progress';
