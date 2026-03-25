import { PreviewCard as BasePreviewCard } from '@base-ui-components/react/preview-card';
import type React from 'react';
import { type ReactElement, forwardRef, isValidElement } from 'react';
import { cn } from '../../lib/cn';

export const PreviewCard = BasePreviewCard.Root;

// --- PreviewCardTrigger ---
export interface PreviewCardTriggerProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  /** Delay in milliseconds before the preview card opens. @default 600 */
  delay?: number;
  /** Delay in milliseconds before the preview card closes. @default 300 */
  closeDelay?: number;
}

export const PreviewCardTrigger = forwardRef<HTMLAnchorElement, PreviewCardTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && isValidElement(children)) {
      return (
        <BasePreviewCard.Trigger
          ref={ref}
          render={children as ReactElement<Record<string, unknown>>}
          {...props}
        />
      );
    }
    return (
      <BasePreviewCard.Trigger ref={ref} {...props}>
        {children}
      </BasePreviewCard.Trigger>
    );
  },
);
PreviewCardTrigger.displayName = 'PreviewCardTrigger';

// --- PreviewCardContent ---
export interface PreviewCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const PreviewCardContent = forwardRef<HTMLDivElement, PreviewCardContentProps>(
  ({ className, sideOffset = 4, side = 'bottom', ...props }, ref) => (
    <BasePreviewCard.Portal>
      <BasePreviewCard.Positioner side={side} sideOffset={sideOffset}>
        <BasePreviewCard.Popup
          ref={ref}
          className={cn('hui-preview-card__content', className)}
          {...props}
        />
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  ),
);
PreviewCardContent.displayName = 'PreviewCardContent';
