import { type DetailsHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export type ReasoningStatus = 'thinking' | 'done';

export interface ReasoningPanelProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  /** Reasoning status */
  status?: ReasoningStatus;
  /** Summary label (defaults to status-based label) */
  summaryLabel?: string;
}

const STATUS_LABEL: Record<ReasoningStatus, string> = {
  thinking: 'Thinking...',
  done: 'Reasoning',
};

const STATUS_ICON: Record<ReasoningStatus, string> = {
  thinking: '↻',
  done: '✦',
};

export const ReasoningPanel = forwardRef<HTMLDetailsElement, ReasoningPanelProps>(
  ({ status = 'done', summaryLabel, className, children, ...props }, ref) => {
    const label = summaryLabel ?? STATUS_LABEL[status];

    return (
      <details
        ref={ref}
        className={cn('hui-reasoning-panel', `hui-reasoning-panel--${status}`, className)}
        {...props}
      >
        <summary className="hui-reasoning-panel__summary">
          <span
            className={cn(
              'hui-reasoning-panel__icon',
              status === 'thinking' && 'hui-reasoning-panel__icon--spinning',
            )}
          >
            {STATUS_ICON[status]}
          </span>
          <span className="hui-reasoning-panel__label">{label}</span>
        </summary>
        <div className="hui-reasoning-panel__content">{children}</div>
      </details>
    );
  },
);
ReasoningPanel.displayName = 'ReasoningPanel';
