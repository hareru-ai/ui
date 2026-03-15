/**
 * DataQualityIndicator — Data quality score + alert display
 *
 * Displays data quality scores computed from DI MCP query_data results
 * using a progress bar + alert badges.
 *
 * @example
 * ```tsx
 * <DataQualityIndicator
 *   datasetName="orders"
 *   overallScore={0.87}
 *   dimensions={[
 *     { name: "completeness", label: "Completeness", score: 0.95, alertLevel: "none" },
 *     { name: "freshness",    label: "Freshness",    score: 0.72, alertLevel: "warning" },
 *     { name: "validity",     label: "Validity",     score: 0.88, alertLevel: "none" },
 *   ]}
 *   alerts={[{ level: "warning", message: "No updates for over 24 hours" }]}
 * />
 * ```
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Alert level */
export type AlertLevel = 'none' | 'info' | 'warning' | 'error';

/** Quality dimension (Completeness / Freshness / Validity / Uniqueness, etc.) */
export interface QualityDimension {
  /** Quality dimension identifier */
  name: string;
  /** Display label (e.g. "Completeness", "Freshness", "Validity") */
  label: string;
  /** Score (0.0 - 1.0) */
  score: number;
  /** Alert level */
  alertLevel: AlertLevel;
  /** Detail message (e.g. "Null rate 5.2%") */
  detail?: string;
}

/** Quality alert */
export interface QualityAlert {
  level: Exclude<AlertLevel, 'none'>;
  message: string;
  /** Related quality dimension name */
  dimension?: string;
}

/** DataQualityIndicator component Props */
export interface DataQualityIndicatorProps extends HTMLAttributes<HTMLElement> {
  /** Dataset name */
  datasetName: string;
  /** Overall score (0.0 - 1.0). null = not yet computed */
  overallScore: number | null;
  /** Per-dimension quality scores */
  dimensions?: QualityDimension[];
  /** Alert list */
  alerts?: QualityAlert[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Detail button click handler */
  onDetailClick?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert score to 0-100 percentage */
function toPercent(score: number): number {
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

/** Return CSS class based on score */
function scoreClass(score: number): string {
  const pct = toPercent(score);
  if (pct >= 90) return 'hui-dq-indicator__score--excellent';
  if (pct >= 70) return 'hui-dq-indicator__score--good';
  if (pct >= 50) return 'hui-dq-indicator__score--fair';
  return 'hui-dq-indicator__score--poor';
}

/** Score label */
function scoreLabel(score: number): string {
  const pct = toPercent(score);
  if (pct >= 90) return 'Excellent';
  if (pct >= 70) return 'Good';
  if (pct >= 50) return 'Fair';
  return 'Needs Improvement';
}

const ALERT_ICONS: Record<Exclude<AlertLevel, 'none'>, string> = {
  info: 'ℹ',
  warning: '⚠',
  error: '✕',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ScoreGaugeProps {
  score: number | null;
  loading?: boolean;
}

const ScoreGauge = ({ score, loading }: ScoreGaugeProps) => {
  if (loading) {
    return <div className="hui-dq-indicator__gauge-skeleton" aria-hidden="true" />;
  }
  if (score == null) {
    return <p className="hui-dq-indicator__gauge-empty">Calculating...</p>;
  }
  const pct = toPercent(score);
  return (
    <div className={cn('hui-dq-indicator__gauge', scoreClass(score))}>
      <div
        className="hui-dq-indicator__gauge-bar"
        role="progressbar"
        tabIndex={-1}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Overall score ${pct}%`}
      >
        <div className="hui-dq-indicator__gauge-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="hui-dq-indicator__gauge-labels">
        <span className="hui-dq-indicator__gauge-value">{pct}%</span>
        <span className="hui-dq-indicator__gauge-label">{scoreLabel(score)}</span>
      </div>
    </div>
  );
};

interface DimensionRowProps {
  dimension: QualityDimension;
}

const DimensionRow = ({ dimension }: DimensionRowProps) => {
  const pct = toPercent(dimension.score);
  return (
    <li className="hui-dq-indicator__dimension">
      <div className="hui-dq-indicator__dimension-header">
        <span className="hui-dq-indicator__dimension-label">
          {dimension.alertLevel !== 'none' && (
            <span
              className={cn(
                'hui-dq-indicator__alert-icon',
                `hui-dq-indicator__alert-icon--${dimension.alertLevel}`,
              )}
              aria-hidden="true"
            >
              {ALERT_ICONS[dimension.alertLevel as Exclude<AlertLevel, 'none'>]}
            </span>
          )}
          {dimension.label}
        </span>
        <span className={cn('hui-dq-indicator__dimension-score', scoreClass(dimension.score))}>
          {pct}%
        </span>
      </div>
      <div
        className="hui-dq-indicator__dimension-bar"
        role="progressbar"
        tabIndex={-1}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${dimension.label}: ${pct}%`}
      >
        <div
          className={cn(
            'hui-dq-indicator__dimension-fill',
            `hui-dq-indicator__dimension-fill--${scoreClass(dimension.score).split('--')[1]}`,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {dimension.detail && <p className="hui-dq-indicator__dimension-detail">{dimension.detail}</p>}
    </li>
  );
};

interface AlertListProps {
  alerts: QualityAlert[];
}

const AlertList = ({ alerts }: AlertListProps) => {
  if (alerts.length === 0) return null;
  return (
    <ul className="hui-dq-indicator__alerts" aria-label="Quality alerts">
      {alerts.map((alert, i) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: alert list order is stable
          key={i}
          className={cn('hui-dq-indicator__alert', `hui-dq-indicator__alert--${alert.level}`)}
          role="alert"
        >
          <span className="hui-dq-indicator__alert-icon" aria-hidden="true">
            {ALERT_ICONS[alert.level]}
          </span>
          <span className="hui-dq-indicator__alert-message">{alert.message}</span>
        </li>
      ))}
    </ul>
  );
};

// ---------------------------------------------------------------------------
// DataQualityIndicator
// ---------------------------------------------------------------------------

/**
 * DataQualityIndicator — Data quality score display
 *
 * Displays quality scores computed from DI `query_data` results
 * as an overall gauge + per-dimension bars + alert list.
 */
export const DataQualityIndicator = forwardRef<HTMLElement, DataQualityIndicatorProps>(
  (
    {
      datasetName,
      overallScore,
      dimensions = [],
      alerts = [],
      loading = false,
      error,
      onDetailClick,
      className,
      ...props
    },
    ref,
  ) => {
    const errorAlerts = alerts.filter((a) => a.level === 'error');
    const warningAlerts = alerts.filter((a) => a.level === 'warning');
    const hasAlerts = alerts.length > 0;

    return (
      <article
        ref={ref}
        className={cn(
          'hui-dq-indicator',
          hasAlerts && 'hui-dq-indicator--has-alerts',
          errorAlerts.length > 0 && 'hui-dq-indicator--has-errors',
          loading && 'hui-dq-indicator--loading',
          error && 'hui-dq-indicator--error',
          className,
        )}
        data-dataset-name={datasetName}
        {...props}
      >
        {/* Header */}
        <header className="hui-dq-indicator__header">
          <div className="hui-dq-indicator__title-group">
            <h4 className="hui-dq-indicator__title">Data Quality</h4>
            <span className="hui-dq-indicator__dataset">{datasetName}</span>
          </div>
          {hasAlerts && (
            <div className="hui-dq-indicator__alert-summary" aria-label="Alert summary">
              {errorAlerts.length > 0 && (
                <span className="hui-dq-indicator__summary-badge hui-dq-indicator__summary-badge--error">
                  {ALERT_ICONS.error} {errorAlerts.length}
                </span>
              )}
              {warningAlerts.length > 0 && (
                <span className="hui-dq-indicator__summary-badge hui-dq-indicator__summary-badge--warning">
                  {ALERT_ICONS.warning} {warningAlerts.length}
                </span>
              )}
            </div>
          )}
        </header>

        {/* Content */}
        {error ? (
          <p className="hui-dq-indicator__error-message" role="alert">
            {error}
          </p>
        ) : (
          <>
            {/* Overall Score Gauge */}
            <ScoreGauge score={overallScore} loading={loading} />

            {/* Dimension Breakdown */}
            {!loading && dimensions.length > 0 && (
              <ul className="hui-dq-indicator__dimensions" aria-label="Quality dimension scores">
                {dimensions.map((dim) => (
                  <DimensionRow key={dim.name} dimension={dim} />
                ))}
              </ul>
            )}

            {/* Alerts */}
            {!loading && <AlertList alerts={alerts} />}
          </>
        )}

        {/* Footer */}
        {onDetailClick && !loading && (
          <footer className="hui-dq-indicator__footer">
            <button
              type="button"
              className="hui-dq-indicator__detail-link"
              onClick={onDetailClick}
              aria-label={`Show data quality details for ${datasetName}`}
            >
              Show Details
            </button>
          </footer>
        )}
      </article>
    );
  },
);
DataQualityIndicator.displayName = 'DataQualityIndicator';
