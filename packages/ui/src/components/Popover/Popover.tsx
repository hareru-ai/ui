import { Popover as BasePopover } from '@base-ui-components/react/popover';
import { type ReactElement, forwardRef, isValidElement } from 'react';
import { cn } from '../../lib/cn';

// --- Root ---
export const Popover = BasePopover.Root;

// --- PopoverAnchor ---
export const PopoverAnchor = BasePopover.Trigger;

// --- PopoverTrigger ---
export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && isValidElement(children)) {
      return (
        <BasePopover.Trigger
          ref={ref}
          render={children as ReactElement<Record<string, unknown>>}
          {...props}
        />
      );
    }
    return (
      <BasePopover.Trigger ref={ref} {...props}>
        {children}
      </BasePopover.Trigger>
    );
  },
);
PopoverTrigger.displayName = 'PopoverTrigger';

// --- PopoverContent ---
export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = 'center', sideOffset = 4, side = 'bottom', ...props }, ref) => (
    <BasePopover.Portal>
      <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset}>
        <BasePopover.Popup ref={ref} className={cn('hui-popover__content', className)} {...props} />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  ),
);
PopoverContent.displayName = 'PopoverContent';
