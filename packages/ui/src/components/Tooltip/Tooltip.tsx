import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import { type ReactElement, forwardRef, isValidElement } from 'react';
import { cn } from '../../lib/cn';

export const TooltipProvider = BaseTooltip.Provider;

export const Tooltip = BaseTooltip.Root;

// --- TooltipTrigger ---
export interface TooltipTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && isValidElement(children)) {
      return (
        <BaseTooltip.Trigger
          ref={ref}
          render={children as ReactElement<Record<string, unknown>>}
          {...props}
        />
      );
    }
    return (
      <BaseTooltip.Trigger ref={ref} {...props}>
        {children}
      </BaseTooltip.Trigger>
    );
  },
);
TooltipTrigger.displayName = 'TooltipTrigger';

// --- TooltipContent ---
export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, side = 'top', ...props }, ref) => (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
        <BaseTooltip.Popup ref={ref} className={cn('hui-tooltip__content', className)} {...props} />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  ),
);
TooltipContent.displayName = 'TooltipContent';
