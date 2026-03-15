import { type HTMLAttributes, type ReactNode, forwardRef, useState } from 'react';
import { cn } from '../../lib/cn';

export type ToolCallStatus = 'pending' | 'executing' | 'done' | 'error';

export interface ToolCallCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Tool name */
  toolName: string;
  /** Execution status */
  status: ToolCallStatus;
  /** Tool arguments (object or partial JSON string for streaming) */
  args?: Record<string, unknown> | string;
  /** Args streaming flag */
  argsStreaming?: boolean;
  /** Execution result — pass sanitized safe ReactNode */
  result?: ReactNode;
  /** Error message */
  error?: string;
  /** Execution duration (ms) — only displayed when status="done" */
  duration?: number;
  /** Whether collapsible */
  collapsible?: boolean;
  /** Initial expanded state */
  defaultExpanded?: boolean;
}

const STATUS_LABEL: Record<ToolCallStatus, string> = {
  pending: 'Pending',
  executing: 'Executing',
  done: 'Done',
  error: 'Error',
};

const STATUS_ICON: Record<ToolCallStatus, string> = {
  pending: '○',
  executing: '↻',
  done: '✓',
  error: '✗',
};

export const ToolCallCard = forwardRef<HTMLDivElement, ToolCallCardProps>(
  (
    {
      toolName,
      status,
      args,
      argsStreaming = false,
      result,
      error,
      duration,
      collapsible = true,
      defaultExpanded = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const hasBody = args != null || result != null || error != null;
    const showBody = !collapsible || expanded;

    return (
      <div
        ref={ref}
        className={cn('hui-tool-call-card', `hui-tool-call-card--${status}`, className)}
        data-tool-name={toolName}
        data-status={status}
        {...props}
      >
        <div className="hui-tool-call-card__header">
          <span className={cn('hui-tool-call-card__icon', `hui-tool-call-card__icon--${status}`)}>
            {STATUS_ICON[status]}
          </span>
          <span className="hui-tool-call-card__name">{toolName}</span>
          <span
            className={cn('hui-tool-call-card__status', `hui-tool-call-card__status--${status}`)}
          >
            {STATUS_LABEL[status]}
          </span>
          {duration != null && status === 'done' && (
            <span className="hui-tool-call-card__duration">{duration}ms</span>
          )}
          {collapsible && hasBody && (
            <button
              type="button"
              className="hui-tool-call-card__toggle"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '▲' : '▼'}
            </button>
          )}
        </div>

        {showBody && hasBody && (
          <div className="hui-tool-call-card__body">
            {args != null && (
              <pre
                className={cn(
                  'hui-tool-call-card__args',
                  argsStreaming && 'hui-tool-call-card__args--streaming',
                )}
              >
                <code>{typeof args === 'string' ? args : JSON.stringify(args, null, 2)}</code>
                {argsStreaming && (
                  <span className="hui-tool-call-card__args-cursor" aria-hidden="true" />
                )}
              </pre>
            )}
            {result != null && <div className="hui-tool-call-card__result">{result}</div>}
            {error != null && (
              <p className="hui-tool-call-card__error" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
ToolCallCard.displayName = 'ToolCallCard';
