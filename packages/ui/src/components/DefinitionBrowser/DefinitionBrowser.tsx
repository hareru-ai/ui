/**
 * DefinitionBrowser — Hareru DI semantic definition browser
 *
 * Displays results from DI MCP list_semantic_models / list_metrics / list_dimensions
 * in a browser UI with search and filter support.
 *
 * @example
 * ```tsx
 * <DefinitionBrowser
 *   models={[{ name: "smb_sales", description: "SMB sales", metricCount: 5 }]}
 *   metrics={[
 *     { name: "total_amount", description: "Total sales", semanticModelName: "smb_sales" }
 *   ]}
 *   dimensions={[
 *     { name: "order_date", description: "Order date", isTime: true, semanticModelName: "smb_sales" }
 *   ]}
 *   onSelectMetric={(metric) => console.log("selected:", metric)}
 * />
 * ```
 *
 * MCP tool mapping:
 *   list_semantic_models → models prop
 *   list_metrics         → metrics prop
 *   list_dimensions      → dimensions prop
 *
 * Spec reference: dev-orchestrator/projects/hareru-di/docs/ui-component-interface.yaml
 */

import { type HTMLAttributes, forwardRef, useMemo, useState } from 'react';
import { cn } from '../../lib/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** DI semantic model (corresponds to the return value of list_semantic_models) */
export interface DiSemanticModel {
  name: string;
  description?: string;
  /** Metric count */
  metricCount?: number;
  /** Dimension count */
  dimensionCount?: number;
  validationStatus?: 'valid' | 'invalid' | 'pending';
}

/** DI metric definition (corresponds to the return value of list_metrics) */
export interface DiMetric {
  name: string;
  description?: string;
  semanticModelName: string;
  aiContext?: string;
}

/** DI dimension definition (corresponds to the return value of list_dimensions) */
export interface DiDimension {
  name: string;
  description?: string;
  semanticModelName: string;
  datasetName?: string;
  isTime?: boolean;
}

/** Browser tab selection */
export type BrowserTab = 'models' | 'metrics' | 'dimensions';

/** DefinitionBrowser component Props */
export interface DefinitionBrowserProps extends HTMLAttributes<HTMLDivElement> {
  /** Semantic model list */
  models?: DiSemanticModel[];
  /** Metric list */
  metrics?: DiMetric[];
  /** Dimension list */
  dimensions?: DiDimension[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Initial active tab */
  defaultTab?: BrowserTab;
  /** Model selection handler */
  onSelectModel?: (model: DiSemanticModel) => void;
  /** Metric selection handler */
  onSelectMetric?: (metric: DiMetric) => void;
  /** Dimension selection handler */
  onSelectDimension?: (dimension: DiDimension) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => (
  <div className="hui-definition-browser__search">
    <svg
      className="hui-definition-browser__search-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <input
      type="search"
      className="hui-definition-browser__search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search definitions"
    />
  </div>
);

interface ValidationBadgeProps {
  status?: DiSemanticModel['validationStatus'];
}

const ValidationBadge = ({ status }: ValidationBadgeProps) => {
  if (!status) return null;
  const labels: Record<NonNullable<typeof status>, string> = {
    valid: 'Validated',
    invalid: 'Error',
    pending: 'Validating',
  };
  return (
    <span
      className={cn('hui-definition-browser__badge', `hui-definition-browser__badge--${status}`)}
    >
      {labels[status]}
    </span>
  );
};

interface ModelListProps {
  models: DiSemanticModel[];
  query: string;
  onSelect?: (model: DiSemanticModel) => void;
}

const ModelList = ({ models, query, onSelect }: ModelListProps) => {
  const filtered = useMemo(
    () =>
      query
        ? models.filter(
            (m) =>
              m.name.toLowerCase().includes(query.toLowerCase()) ||
              m.description?.toLowerCase().includes(query.toLowerCase()),
          )
        : models,
    [models, query],
  );

  if (filtered.length === 0) {
    return (
      <p className="hui-definition-browser__empty">
        {query ? `No models matching "${query}"` : 'No models registered'}
      </p>
    );
  }

  return (
    <ul className="hui-definition-browser__list" aria-label="Semantic models">
      {filtered.map((model) => (
        <li key={model.name}>
          <button
            type="button"
            className="hui-definition-browser__item"
            onClick={() => onSelect?.(model)}
          >
            <div className="hui-definition-browser__item-header">
              <span className="hui-definition-browser__item-name">{model.name}</span>
              <ValidationBadge status={model.validationStatus} />
            </div>
            {model.description && (
              <p className="hui-definition-browser__item-description">{model.description}</p>
            )}
            <div className="hui-definition-browser__item-meta">
              {model.metricCount != null && <span>{model.metricCount} metrics</span>}
              {model.dimensionCount != null && <span>{model.dimensionCount} dimensions</span>}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
};

interface MetricListProps {
  metrics: DiMetric[];
  query: string;
  onSelect?: (metric: DiMetric) => void;
}

const MetricList = ({ metrics, query, onSelect }: MetricListProps) => {
  const filtered = useMemo(
    () =>
      query
        ? metrics.filter(
            (m) =>
              m.name.toLowerCase().includes(query.toLowerCase()) ||
              m.description?.toLowerCase().includes(query.toLowerCase()),
          )
        : metrics,
    [metrics, query],
  );

  if (filtered.length === 0) {
    return (
      <p className="hui-definition-browser__empty">
        {query ? `No metrics matching "${query}"` : 'No metrics registered'}
      </p>
    );
  }

  return (
    <ul className="hui-definition-browser__list" aria-label="Metrics">
      {filtered.map((metric) => (
        <li key={`${metric.semanticModelName}/${metric.name}`}>
          <button
            type="button"
            className="hui-definition-browser__item"
            onClick={() => onSelect?.(metric)}
          >
            <div className="hui-definition-browser__item-header">
              <span className="hui-definition-browser__item-name">{metric.name}</span>
              <span className="hui-definition-browser__item-tag">Metric</span>
            </div>
            {metric.description && (
              <p className="hui-definition-browser__item-description">{metric.description}</p>
            )}
            <p className="hui-definition-browser__item-model">{metric.semanticModelName}</p>
          </button>
        </li>
      ))}
    </ul>
  );
};

interface DimensionListProps {
  dimensions: DiDimension[];
  query: string;
  onSelect?: (dimension: DiDimension) => void;
}

const DimensionList = ({ dimensions, query, onSelect }: DimensionListProps) => {
  const filtered = useMemo(
    () =>
      query
        ? dimensions.filter(
            (d) =>
              d.name.toLowerCase().includes(query.toLowerCase()) ||
              d.description?.toLowerCase().includes(query.toLowerCase()),
          )
        : dimensions,
    [dimensions, query],
  );

  if (filtered.length === 0) {
    return (
      <p className="hui-definition-browser__empty">
        {query ? `No dimensions matching "${query}"` : 'No dimensions registered'}
      </p>
    );
  }

  return (
    <ul className="hui-definition-browser__list" aria-label="Dimensions">
      {filtered.map((dim) => (
        <li key={`${dim.semanticModelName}/${dim.datasetName ?? ''}/${dim.name}`}>
          <button
            type="button"
            className="hui-definition-browser__item"
            onClick={() => onSelect?.(dim)}
          >
            <div className="hui-definition-browser__item-header">
              <span className="hui-definition-browser__item-name">{dim.name}</span>
              {dim.isTime && (
                <span className="hui-definition-browser__item-tag hui-definition-browser__item-tag--time">
                  Time
                </span>
              )}
            </div>
            {dim.description && (
              <p className="hui-definition-browser__item-description">{dim.description}</p>
            )}
            <p className="hui-definition-browser__item-model">{dim.semanticModelName}</p>
          </button>
        </li>
      ))}
    </ul>
  );
};

// ---------------------------------------------------------------------------
// DefinitionBrowser
// ---------------------------------------------------------------------------

const TAB_LABELS: Record<BrowserTab, string> = {
  models: 'Models',
  metrics: 'Metrics',
  dimensions: 'Dimensions',
};

/**
 * DefinitionBrowser — Hareru DI semantic definition browser
 *
 * A UI component for browsing DI MCP list_semantic_models / list_metrics / list_dimensions
 * results with tab switching and text search.
 */
export const DefinitionBrowser = forwardRef<HTMLDivElement, DefinitionBrowserProps>(
  (
    {
      models = [],
      metrics = [],
      dimensions = [],
      loading = false,
      error,
      defaultTab = 'models',
      onSelectModel,
      onSelectMetric,
      onSelectDimension,
      className,
      ...props
    },
    ref,
  ) => {
    const [activeTab, setActiveTab] = useState<BrowserTab>(defaultTab);
    const [query, setQuery] = useState('');

    const tabs: BrowserTab[] = ['models', 'metrics', 'dimensions'];
    const counts: Record<BrowserTab, number> = {
      models: models.length,
      metrics: metrics.length,
      dimensions: dimensions.length,
    };

    return (
      <div ref={ref} className={cn('hui-definition-browser', className)} {...props}>
        {/* Tab Navigation */}
        <div className="hui-definition-browser__tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={activeTab === tab}
              className={cn(
                'hui-definition-browser__tab',
                activeTab === tab && 'hui-definition-browser__tab--active',
              )}
              onClick={() => {
                setActiveTab(tab);
                setQuery('');
              }}
            >
              {TAB_LABELS[tab]}
              <span className="hui-definition-browser__tab-count">{counts[tab]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="hui-definition-browser__toolbar">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={`Search ${TAB_LABELS[activeTab].toLowerCase()}...`}
          />
        </div>

        {/* Content */}
        <div
          role="tabpanel"
          aria-label={TAB_LABELS[activeTab]}
          className="hui-definition-browser__panel"
        >
          {loading ? (
            <div className="hui-definition-browser__loading" aria-live="polite">
              <div className="hui-definition-browser__skeleton" aria-hidden="true" />
              <div className="hui-definition-browser__skeleton" aria-hidden="true" />
              <div className="hui-definition-browser__skeleton" aria-hidden="true" />
            </div>
          ) : error ? (
            <p className="hui-definition-browser__error" role="alert">
              {error}
            </p>
          ) : (
            <>
              {activeTab === 'models' && (
                <ModelList models={models} query={query} onSelect={onSelectModel} />
              )}
              {activeTab === 'metrics' && (
                <MetricList metrics={metrics} query={query} onSelect={onSelectMetric} />
              )}
              {activeTab === 'dimensions' && (
                <DimensionList dimensions={dimensions} query={query} onSelect={onSelectDimension} />
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);
DefinitionBrowser.displayName = 'DefinitionBrowser';
