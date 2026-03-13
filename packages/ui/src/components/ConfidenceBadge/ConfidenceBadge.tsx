import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';
import './ConfidenceBadge.css';

export type ConfidenceLevel = 'auto' | 'validated' | 'reviewed' | 'authored';

export interface ConfidenceBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Confidence level */
  level: ConfidenceLevel;
  /** Confidence score (0.0-1.0). Displayed as percentage when showScore is true. */
  score?: number;
  /** Whether to show the numeric score. Default: true */
  showScore?: boolean;
  /** Badge size. Default: 'sm' */
  size?: 'sm' | 'md';
}

const LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  auto: 'Auto',
  validated: 'Validated',
  reviewed: 'Reviewed',
  authored: 'Authored',
};

function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export const ConfidenceBadge = forwardRef<HTMLSpanElement, ConfidenceBadgeProps>(
  ({ level, score, showScore = true, size = 'sm', className, ...props }, ref) => {
    const label = LEVEL_LABELS[level];
    const scoreText = score != null && showScore ? ` ${formatScore(score)}` : '';
    const titleText =
      score != null
        ? `Confidence: ${level} (${formatScore(score)})`
        : `Confidence: ${level}`;

    return (
      <span
        ref={ref}
        className={cn(
          'hui-confidence-badge',
          `hui-confidence-badge--${level}`,
          `hui-confidence-badge--${size}`,
          className,
        )}
        data-level={level}
        title={titleText}
        {...props}
      >
        {label}{scoreText}
      </span>
    );
  },
);
ConfidenceBadge.displayName = 'ConfidenceBadge';
