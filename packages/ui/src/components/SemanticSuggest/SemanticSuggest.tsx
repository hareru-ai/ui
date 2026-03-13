import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';
import './SemanticSuggest.css';

export type SuggestionType = 'add_synonym' | 'add_gotcha' | 'split_metric' | 'update_instruction';
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected';

export interface SuggestionEvidence {
  /** Number of queries that triggered this suggestion */
  queryCount?: number;
  /** Success rate of related queries (0.0-1.0) */
  successRate?: number;
  /** Detected pattern description */
  pattern?: string;
}

export interface SemanticSuggestProps extends HTMLAttributes<HTMLDivElement> {
  /** Suggestion type */
  type: SuggestionType;
  /** Suggestion title */
  title: string;
  /** Detailed description */
  description?: string;
  /** Evidence/rationale for the suggestion */
  evidence?: SuggestionEvidence;
  /** Preview of the suggested change */
  preview?: string;
  /** Current status */
  status?: SuggestionStatus;
  /** Confidence score of this suggestion (0.0-1.0) */
  confidence?: number;
  /** Accept handler */
  onAccept?: () => void;
  /** Reject/dismiss handler */
  onReject?: () => void;
  /** Accept button label. Default: "Accept" */
  acceptLabel?: string;
  /** Reject button label. Default: "Dismiss" */
  rejectLabel?: string;
}

const TYPE_ICON: Record<SuggestionType, string> = {
  add_synonym: '+',
  add_gotcha: '!',
  split_metric: '/',
  update_instruction: '~',
};

const STATUS_LABEL: Record<Exclude<SuggestionStatus, 'pending'>, string> = {
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export const SemanticSuggest = forwardRef<HTMLDivElement, SemanticSuggestProps>(
  (
    {
      type,
      title,
      description,
      evidence,
      preview,
      status = 'pending',
      confidence,
      onAccept,
      onReject,
      acceptLabel = 'Accept',
      rejectLabel = 'Dismiss',
      className,
      ...props
    },
    ref,
  ) => {
    const evidenceParts: string[] = [];
    if (evidence?.queryCount != null) {
      evidenceParts.push(`${evidence.queryCount} queries`);
    }
    if (evidence?.successRate != null) {
      evidenceParts.push(`${Math.round(evidence.successRate * 100)}%`);
    }
    if (evidence?.pattern) {
      evidenceParts.push(evidence.pattern);
    }

    return (
      <div
        ref={ref}
        className={cn(
          'hui-semantic-suggest',
          `hui-semantic-suggest--${status}`,
          `hui-semantic-suggest--${type}`,
          className,
        )}
        data-type={type}
        data-status={status}
        role="region"
        aria-label={title}
        {...props}
      >
        <div className="hui-semantic-suggest__header">
          <span className={cn('hui-semantic-suggest__icon', `hui-semantic-suggest__icon--${type}`)} aria-hidden="true">
            {TYPE_ICON[type]}
          </span>
          <span>{title}</span>
          {confidence != null && (
            <span className="hui-semantic-suggest__confidence">
              {Math.round(confidence * 100)}%
            </span>
          )}
        </div>

        {description && (
          <p className="hui-semantic-suggest__description">{description}</p>
        )}

        {evidenceParts.length > 0 && (
          <div className="hui-semantic-suggest__evidence">
            {evidenceParts.map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </div>
        )}

        {preview && (
          <pre className="hui-semantic-suggest__preview">{preview}</pre>
        )}

        {status === 'pending' && (
          <div className="hui-semantic-suggest__actions">
            <button
              type="button"
              className="hui-semantic-suggest__reject"
              aria-label={`${rejectLabel}: ${title}`}
              onClick={onReject}
            >
              {rejectLabel}
            </button>
            <button
              type="button"
              className="hui-semantic-suggest__accept"
              aria-label={`${acceptLabel}: ${title}`}
              onClick={onAccept}
            >
              {acceptLabel}
            </button>
          </div>
        )}

        {status !== 'pending' && (
          <div className="hui-semantic-suggest__status-label">
            {STATUS_LABEL[status]}
          </div>
        )}
      </div>
    );
  },
);
SemanticSuggest.displayName = 'SemanticSuggest';
