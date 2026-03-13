import { ScrollArea as BaseScrollArea } from '@base-ui-components/react/scroll-area';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- ScrollArea ---
export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <BaseScrollArea.Root ref={ref} className={cn('hui-scroll-area', className)} {...props}>
      <BaseScrollArea.Viewport className="hui-scroll-area__viewport">
        {children}
      </BaseScrollArea.Viewport>
      <ScrollBar />
      <BaseScrollArea.Corner />
    </BaseScrollArea.Root>
  ),
);
ScrollArea.displayName = 'ScrollArea';

// --- ScrollBar ---
export interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
}

export const ScrollBar = forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <BaseScrollArea.Scrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        'hui-scroll-area__scrollbar',
        `hui-scroll-area__scrollbar--${orientation}`,
        className,
      )}
      {...props}
    >
      <BaseScrollArea.Thumb className="hui-scroll-area__thumb" />
    </BaseScrollArea.Scrollbar>
  ),
);
ScrollBar.displayName = 'ScrollBar';
