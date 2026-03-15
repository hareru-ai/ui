/**
 * MetricCard — Hareru DI metric card component
 *
 * Displays the result of the DI MCP get_metric_definition tool.
 * Presents metric value, confidence score, data freshness, and definition link in a single card.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   metricName="total_amount"
 *   displayName="Total Sales"
 *   value={1234567}
 *   unit="USD"
 *   description="Sum of all order amounts"
 *   freshness={{ lastUpdatedAt: new Date(), staleness: "fresh" }}
 *   confidence={0.98}
 *   semanticModelName="smb_sales"
 *   onDefinitionClick={() => openDefinitionPanel("total_amount")}
 * />
 * ```
 *
 * MCP tool mapping: get_metric_definition
 * Spec reference: dev-orchestrator/projects/hareru-di/docs/ui-component-interface.yaml
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Data freshness status */
export type StalenessStatus = 'fresh' | 'stale' | 'unknown';

/** Data freshness information */
export interface MetricFreshness {
  /** Timestamp of the last update */
  lastUpdatedAt: Date;
  /** Freshness status: fresh (<1h) / stale (>24h) / unknown */
  staleness: StalenessStatus;
  /** Human-readable freshness label (e.g. "Updated 5 minutes ago") */
  label?: string;
}

/** MetricCard component props */
export interface MetricCardProps extends HTMLAttributes<HTMLElement> {
  /** Internal metric name (identifier used in DI) */
  metricName: string;
  /** Display label shown to the user */
  displayName: string;
  /** Metric value (null = loading or no data available) */
  value: number | null;
  /** Unit of measurement (e.g. "USD", "%", "items") */
  unit?: string;
  /** Description of the metric */
  description?: string;
  /** Data freshness information */
  freshness?: MetricFreshness;
  /** Confidence score (0.0 - 1.0). null = no score available */
  confidence?: number | null;
  /** Semantic model name */
  semanticModelName?: string;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Handler called when the definition link is clicked */
  onDefinitionClick?: () => void;
  /** Custom value formatter (default: toLocaleString('en-US')) */
  formatValue?: (value: number, unit?: string) => string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_FORMAT = (value: number, unit?: string): string => {
  const formatted = value.toLocaleString('en-US');
  return unit ? `${formatted} ${unit}` : formatted;
};

const STALENESS_CLASS: Record<StalenessStatus, string> = {
  fresh: 'hui-metric-card__freshness--fresh',
  stale: 'hui-metric-card__freshness--stale',
  unknown: 'hui-metric-card__freshness--unknown',
};

const STALENESS_LABEL: Record<StalenessStatus, string> = {
  fresh: 'Fresh',
  stale: 'Stale',
  unknown: 'Unknown',
};

/** Converts a confidence score (0.0-1.0) to a percentage string */
function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/** Returns the visual CSS class for a given confidence score */
function confidenceClass(confidence: number): string {
  if (confidence >= 0.95) return 'hui-metric-card__confidence--high';
  if (confidence >= 0.8) return 'hui-metric-card__confidence--medium';
  return 'hui-metric-card__confidence--low';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FreshnessIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  freshness: MetricFreshness;
}

const FreshnessIndicator = forwardRef<HTMLSpanElement, FreshnessIndicatorProps>(
  ({ freshness, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('hui-metric-card__freshness', STALENESS_CLASS[freshness.staleness], className)}
      title={`Last updated: ${freshness.lastUpdatedAt.toLocaleString('en-US')}`}
      {...props}
    >
      {freshness.label ?? STALENESS_LABEL[freshness.staleness]}
    </span>
  ),
);
FreshnessIndicator.displayName = 'FreshnessIndicator';

interface ConfidenceBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  confidence: number;
}

const ConfidenceBadge = forwardRef<HTMLSpanElement, ConfidenceBadgeProps>(
  ({ confidence, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('hui-metric-card__confidence', confidenceClass(confidence), className)}
      title={`Confidence score: ${formatConfidence(confidence)}`}
      {...props}
    >
      Confidence {formatConfidence(confidence)}
    </span>
  ),
);
ConfidenceBadge.displayName = 'ConfidenceBadge';

// ---------------------------------------------------------------------------
// MetricCard
// ---------------------------------------------------------------------------

/**
 * MetricCard — Hareru DI metric card
 *
 * Pass the return value of the DI MCP `get_metric_definition` tool directly as props.
 */
export const MetricCard = forwardRef<HTMLElement, MetricCardProps>(
  (
    {
      metricName,
      displayName,
      value,
      unit,
      description,
      freshness,
      confidence,
      semanticModelName,
      loading = false,
      error,
      onDefinitionClick,
      formatValue = DEFAULT_FORMAT,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <article
        ref={ref}
        className={cn(
          'hui-metric-card',
          loading && 'hui-metric-card--loading',
          error && 'hui-metric-card--error',
          className,
        )}
        data-metric-name={metricName}
        data-model-name={semanticModelName}
        {...props}
      >
        {/* Header */}
        <header className="hui-metric-card__header">
          <span className="hui-metric-card__label">{displayName}</span>
          <div className="hui-metric-card__badges">
            {freshness && <FreshnessIndicator freshness={freshness} />}
            {confidence != null && <ConfidenceBadge confidence={confidence} />}
          </div>
        </header>

        {/* Value */}
        <div className="hui-metric-card__body">
          {loading ? (
            <div className="hui-metric-card__skeleton" aria-hidden="true" />
          ) : error ? (
            <p className="hui-metric-card__error" role="alert">
              {error}
            </p>
          ) : (
            <p className="hui-metric-card__value">
              {value != null ? formatValue(value, unit) : '—'}
            </p>
          )}
          {description && !error && <p className="hui-metric-card__description">{description}</p>}
        </div>

        {/* Footer */}
        <footer className="hui-metric-card__footer">
          {semanticModelName && <span className="hui-metric-card__model">{semanticModelName}</span>}
          {onDefinitionClick && (
            <button
              type="button"
              className="hui-metric-card__definition-link"
              onClick={onDefinitionClick}
              aria-label={`View definition of ${displayName}`}
            >
              View Definition
            </button>
          )}
        </footer>
      </article>
    );
  },
);
MetricCard.displayName = 'MetricCard';
