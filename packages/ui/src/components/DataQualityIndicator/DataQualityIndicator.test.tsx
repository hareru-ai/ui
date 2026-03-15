import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataQualityIndicator } from './DataQualityIndicator';

const BASE_PROPS = {
  datasetName: 'public.orders',
  overallScore: 0.87,
};

const SAMPLE_DIMENSIONS = [
  { name: 'completeness', label: 'Completeness', score: 0.95, alertLevel: 'none' as const },
  {
    name: 'freshness',
    label: 'Freshness',
    score: 0.72,
    alertLevel: 'warning' as const,
    detail: 'No updates for over 24 hours',
  },
  { name: 'validity', label: 'Validity', score: 0.88, alertLevel: 'none' as const },
];

const SAMPLE_ALERTS = [
  { level: 'warning' as const, message: 'No updates for over 25 hours' },
  { level: 'info' as const, message: 'Null rate 2.1%' },
];

describe('DataQualityIndicator', () => {
  describe('Header', () => {
    it('renders "Data Quality" title', () => {
      render(<DataQualityIndicator {...BASE_PROPS} />);
      expect(screen.getByRole('heading', { name: 'Data Quality' })).toBeInTheDocument();
    });

    it('renders dataset name', () => {
      render(<DataQualityIndicator {...BASE_PROPS} />);
      expect(screen.getByText('public.orders')).toBeInTheDocument();
    });
  });

  describe('Overall score gauge', () => {
    it('renders score as percentage (87%)', () => {
      render(<DataQualityIndicator {...BASE_PROPS} />);
      expect(screen.getByText('87%')).toBeInTheDocument();
    });

    it('renders score label "Good" for 0.87', () => {
      render(<DataQualityIndicator {...BASE_PROPS} />);
      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('renders score label "Excellent" for score >= 0.90', () => {
      render(<DataQualityIndicator {...BASE_PROPS} overallScore={0.95} />);
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('renders score label "Needs Improvement" for score < 0.50', () => {
      render(<DataQualityIndicator {...BASE_PROPS} overallScore={0.4} />);
      expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
    });

    it('renders "Calculating..." when overallScore is null', () => {
      render(<DataQualityIndicator {...BASE_PROPS} overallScore={null} />);
      expect(screen.getByText('Calculating...')).toBeInTheDocument();
    });

    it('renders skeleton when loading=true', () => {
      render(<DataQualityIndicator {...BASE_PROPS} loading />);
      const skeleton = document.querySelector('.hui-dq-indicator__gauge-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('progressbar has correct aria-valuenow', () => {
      render(<DataQualityIndicator {...BASE_PROPS} />);
      const bar = screen.getByRole('progressbar', { name: /Overall score 87%/ });
      expect(bar).toHaveAttribute('aria-valuenow', '87');
    });
  });

  describe('Dimension breakdown', () => {
    it('renders dimension labels', () => {
      render(<DataQualityIndicator {...BASE_PROPS} dimensions={SAMPLE_DIMENSIONS} />);
      expect(screen.getByText('Completeness')).toBeInTheDocument();
      expect(screen.getByText('Freshness')).toBeInTheDocument();
      expect(screen.getByText('Validity')).toBeInTheDocument();
    });

    it('renders dimension scores as percentages', () => {
      render(<DataQualityIndicator {...BASE_PROPS} dimensions={SAMPLE_DIMENSIONS} />);
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
      expect(screen.getByText('88%')).toBeInTheDocument();
    });

    it('renders dimension detail text', () => {
      render(<DataQualityIndicator {...BASE_PROPS} dimensions={SAMPLE_DIMENSIONS} />);
      expect(screen.getByText('No updates for over 24 hours')).toBeInTheDocument();
    });

    it('renders dimension progressbars', () => {
      render(<DataQualityIndicator {...BASE_PROPS} dimensions={SAMPLE_DIMENSIONS} />);
      const bars = screen.getAllByRole('progressbar');
      // overall 1 + dimensions 3 = 4
      expect(bars.length).toBe(4);
    });
  });

  describe('Alerts', () => {
    it('renders alert messages', () => {
      render(<DataQualityIndicator {...BASE_PROPS} alerts={SAMPLE_ALERTS} />);
      expect(screen.getByText('No updates for over 25 hours')).toBeInTheDocument();
      expect(screen.getByText('Null rate 2.1%')).toBeInTheDocument();
    });

    it('shows alert summary badges in header when alerts exist', () => {
      render(
        <DataQualityIndicator
          {...BASE_PROPS}
          alerts={[
            { level: 'error', message: 'Data missing' },
            { level: 'warning', message: 'Freshness degraded' },
          ]}
        />,
      );
      expect(screen.getByLabelText('Alert summary')).toBeInTheDocument();
    });

    it('applies error border class when error alerts exist', () => {
      render(
        <DataQualityIndicator
          {...BASE_PROPS}
          alerts={[{ level: 'error', message: 'Critical error' }]}
        />,
      );
      expect(document.querySelector('.hui-dq-indicator--has-errors')).toBeInTheDocument();
    });
  });

  describe('Detail link', () => {
    it('renders detail button when onDetailClick is provided', () => {
      const onDetailClick = vi.fn();
      render(<DataQualityIndicator {...BASE_PROPS} onDetailClick={onDetailClick} />);
      expect(
        screen.getByRole('button', { name: /Show data quality details for public.orders/ }),
      ).toBeInTheDocument();
    });

    it('fires onDetailClick when button is clicked', async () => {
      const user = userEvent.setup();
      const onDetailClick = vi.fn();
      render(<DataQualityIndicator {...BASE_PROPS} onDetailClick={onDetailClick} />);
      await user.click(
        screen.getByRole('button', { name: /Show data quality details for public.orders/ }),
      );
      expect(onDetailClick).toHaveBeenCalledTimes(1);
    });

    it('does not render detail button when handler is not provided', () => {
      render(<DataQualityIndicator {...BASE_PROPS} />);
      expect(screen.queryByText('Show Details')).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('renders error message', () => {
      render(<DataQualityIndicator {...BASE_PROPS} error="Failed to fetch quality score" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch quality score');
    });

    it('applies error border class', () => {
      render(<DataQualityIndicator {...BASE_PROPS} error="Error" />);
      expect(document.querySelector('.hui-dq-indicator--error')).toBeInTheDocument();
    });
  });

  describe('a11y and ref', () => {
    it('renders article element', () => {
      render(<DataQualityIndicator {...BASE_PROPS} />);
      expect(document.querySelector('article.hui-dq-indicator')).toBeInTheDocument();
    });

    it('gauge region has aria-label', () => {
      render(<DataQualityIndicator {...BASE_PROPS} />);
      expect(screen.getByRole('progressbar', { name: /Overall score/ })).toBeInTheDocument();
    });

    it('merges custom className', () => {
      render(<DataQualityIndicator {...BASE_PROPS} className="custom-dq" />);
      expect(document.querySelector('.hui-dq-indicator.custom-dq')).toBeInTheDocument();
    });

    it('forwards data-dataset-name attribute', () => {
      render(<DataQualityIndicator {...BASE_PROPS} />);
      expect(document.querySelector('[data-dataset-name="public.orders"]')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = createRef<HTMLElement>();
      render(<DataQualityIndicator {...BASE_PROPS} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current).toHaveClass('hui-dq-indicator');
    });
  });
});
