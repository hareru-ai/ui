import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DefinitionBrowser } from './DefinitionBrowser';

const SAMPLE_MODELS = [
  {
    name: 'smb_sales',
    description: 'SMB Sales Model',
    metricCount: 5,
    validationStatus: 'valid' as const,
  },
  {
    name: 'hr_model',
    description: 'HR Model',
    metricCount: 3,
    validationStatus: 'pending' as const,
  },
];

const SAMPLE_METRICS = [
  { name: 'total_amount', description: 'Total sales', semanticModelName: 'smb_sales' },
  { name: 'order_count', description: 'Order count', semanticModelName: 'smb_sales' },
];

const SAMPLE_DIMENSIONS = [
  { name: 'order_date', description: 'Order date', semanticModelName: 'smb_sales', isTime: true },
  {
    name: 'customer_id',
    description: 'Customer ID',
    semanticModelName: 'smb_sales',
    isTime: false,
  },
];

describe('DefinitionBrowser', () => {
  describe('Tab navigation', () => {
    it('renders three tabs: Models / Metrics / Dimensions', () => {
      render(<DefinitionBrowser models={SAMPLE_MODELS} />);
      expect(screen.getByRole('tab', { name: /Models/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Metrics/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Dimensions/ })).toBeInTheDocument();
    });

    it('shows models tab as active by default', () => {
      render(<DefinitionBrowser models={SAMPLE_MODELS} />);
      expect(screen.getByRole('tab', { name: /Models/ })).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to metrics tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DefinitionBrowser models={SAMPLE_MODELS} metrics={SAMPLE_METRICS} />);
      await user.click(screen.getByRole('tab', { name: /Metrics/ }));
      expect(screen.getByRole('tab', { name: /Metrics/ })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('total_amount')).toBeInTheDocument();
    });

    it('switches to dimensions tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DefinitionBrowser dimensions={SAMPLE_DIMENSIONS} />);
      await user.click(screen.getByRole('tab', { name: /Dimensions/ }));
      expect(screen.getByText('order_date')).toBeInTheDocument();
    });

    it('renders correct count badges', () => {
      render(
        <DefinitionBrowser
          models={SAMPLE_MODELS}
          metrics={SAMPLE_METRICS}
          dimensions={SAMPLE_DIMENSIONS}
        />,
      );
      expect(screen.getByRole('tab', { name: /Models 2/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Metrics 2/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Dimensions 2/ })).toBeInTheDocument();
    });

    it('respects defaultTab prop', () => {
      render(<DefinitionBrowser metrics={SAMPLE_METRICS} defaultTab="metrics" />);
      expect(screen.getByRole('tab', { name: /Metrics/ })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Model list', () => {
    it('renders model names and descriptions', () => {
      render(<DefinitionBrowser models={SAMPLE_MODELS} />);
      expect(screen.getByText('smb_sales')).toBeInTheDocument();
      expect(screen.getByText('SMB Sales Model')).toBeInTheDocument();
    });

    it('renders validation status badges', () => {
      render(<DefinitionBrowser models={SAMPLE_MODELS} />);
      expect(screen.getByText('Validated')).toBeInTheDocument();
      expect(screen.getByText('Validating')).toBeInTheDocument();
    });

    it('renders metric count', () => {
      render(<DefinitionBrowser models={SAMPLE_MODELS} />);
      expect(screen.getByText('5 metrics')).toBeInTheDocument();
    });

    it('fires onSelectModel when a model is clicked', async () => {
      const user = userEvent.setup();
      const onSelectModel = vi.fn();
      render(<DefinitionBrowser models={SAMPLE_MODELS} onSelectModel={onSelectModel} />);
      await user.click(screen.getByText('smb_sales'));
      expect(onSelectModel).toHaveBeenCalledWith(SAMPLE_MODELS[0]);
    });

    it('shows empty state when no models', () => {
      render(<DefinitionBrowser models={[]} />);
      expect(screen.getByText('No models registered')).toBeInTheDocument();
    });
  });

  describe('Search filtering', () => {
    it('filters models by search query', async () => {
      const user = userEvent.setup();
      render(<DefinitionBrowser models={SAMPLE_MODELS} />);
      const input = screen.getByRole('searchbox');
      await user.type(input, 'sales');
      expect(screen.getByText('smb_sales')).toBeInTheDocument();
      expect(screen.queryByText('hr_model')).not.toBeInTheDocument();
    });

    it('shows no-match message when search returns empty', async () => {
      const user = userEvent.setup();
      render(<DefinitionBrowser models={SAMPLE_MODELS} />);
      await user.type(screen.getByRole('searchbox'), 'xyznotexist');
      expect(screen.getByText(/No models matching "xyznotexist"/)).toBeInTheDocument();
    });

    it('clears search query when switching tabs', async () => {
      const user = userEvent.setup();
      render(<DefinitionBrowser models={SAMPLE_MODELS} metrics={SAMPLE_METRICS} />);
      const input = screen.getByRole('searchbox');
      await user.type(input, 'sales');
      await user.click(screen.getByRole('tab', { name: /Metrics/ }));
      expect(screen.getByRole('searchbox')).toHaveValue('');
    });
  });

  describe('Loading and error states', () => {
    it('shows skeleton loader when loading=true', () => {
      render(<DefinitionBrowser loading />);
      const skeletons = document.querySelectorAll('.hui-definition-browser__skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows error message when error prop is set', () => {
      render(<DefinitionBrowser error="Failed to load" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load');
    });
  });

  describe('Dimension list', () => {
    it('shows time dimension tag for time dimensions', async () => {
      const user = userEvent.setup();
      render(<DefinitionBrowser dimensions={SAMPLE_DIMENSIONS} defaultTab="dimensions" />);
      expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('fires onSelectDimension when clicked', async () => {
      const user = userEvent.setup();
      const onSelectDimension = vi.fn();
      render(
        <DefinitionBrowser
          dimensions={SAMPLE_DIMENSIONS}
          defaultTab="dimensions"
          onSelectDimension={onSelectDimension}
        />,
      );
      await user.click(screen.getByText('order_date'));
      expect(onSelectDimension).toHaveBeenCalledWith(SAMPLE_DIMENSIONS[0]);
    });
  });

  describe('a11y and ref', () => {
    it('has role=tablist for tab navigation', () => {
      render(<DefinitionBrowser models={SAMPLE_MODELS} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('has role=tabpanel for content area', () => {
      render(<DefinitionBrowser models={SAMPLE_MODELS} />);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = createRef<HTMLDivElement>();
      render(<DefinitionBrowser ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass('hui-definition-browser');
    });
  });
});
