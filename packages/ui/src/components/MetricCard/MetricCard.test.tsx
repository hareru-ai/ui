import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  const baseProps = {
    metricName: 'total_amount',
    displayName: 'Total Sales',
    value: 1234567,
  };

  it('renders displayName and value', () => {
    render(<MetricCard {...baseProps} unit="USD" />);
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText(/1,234,567/)).toBeInTheDocument();
  });

  it('renders dash when value is null', () => {
    render(<MetricCard {...baseProps} value={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading=true', () => {
    render(<MetricCard {...baseProps} loading />);
    // skeleton is aria-hidden="true"
    const skeleton = document.querySelector('.hui-metric-card__skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders error message when error prop is set', () => {
    render(<MetricCard {...baseProps} error="Failed to fetch data" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch data');
  });

  it('applies hui-metric-card--error class when error prop is set', () => {
    render(<MetricCard {...baseProps} error="Error" />);
    expect(document.querySelector('.hui-metric-card--error')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MetricCard {...baseProps} description="Total amount of all orders" />);
    expect(screen.getByText('Total amount of all orders')).toBeInTheDocument();
  });

  it('renders semantic model name in footer', () => {
    render(<MetricCard {...baseProps} semanticModelName="smb_sales" />);
    expect(screen.getByText('smb_sales')).toBeInTheDocument();
  });

  it('renders freshness badge', () => {
    const freshness = {
      lastUpdatedAt: new Date('2026-02-24T10:00:00Z'),
      staleness: 'fresh' as const,
      label: 'Updated 5 minutes ago',
    };
    render(<MetricCard {...baseProps} freshness={freshness} />);
    expect(screen.getByText('Updated 5 minutes ago')).toBeInTheDocument();
  });

  it('renders freshness badge with default label when label is omitted', () => {
    const freshness = {
      lastUpdatedAt: new Date('2026-02-24T10:00:00Z'),
      staleness: 'stale' as const,
    };
    render(<MetricCard {...baseProps} freshness={freshness} />);
    expect(screen.getByText('Stale')).toBeInTheDocument();
  });

  it('renders confidence badge', () => {
    render(<MetricCard {...baseProps} confidence={0.98} />);
    expect(screen.getByText(/Confidence 98%/)).toBeInTheDocument();
  });

  it('renders definition link button and fires handler', async () => {
    const user = userEvent.setup();
    const onDefinitionClick = vi.fn();
    render(<MetricCard {...baseProps} onDefinitionClick={onDefinitionClick} />);
    const btn = screen.getByRole('button', { name: 'View definition of Total Sales' });
    await user.click(btn);
    expect(onDefinitionClick).toHaveBeenCalledTimes(1);
  });

  it('does not render definition link when handler is not provided', () => {
    render(<MetricCard {...baseProps} />);
    expect(screen.queryByText('View Definition')).not.toBeInTheDocument();
  });

  it('uses custom formatValue function', () => {
    const formatValue = vi.fn((v: number) => `¥${v.toLocaleString()}`);
    render(<MetricCard {...baseProps} formatValue={formatValue} />);
    expect(formatValue).toHaveBeenCalledWith(1234567, undefined);
    expect(screen.getByText(/¥1,234,567/)).toBeInTheDocument();
  });

  it('renders base class', () => {
    render(<MetricCard {...baseProps} />);
    expect(document.querySelector('.hui-metric-card')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<MetricCard {...baseProps} className="custom-metric" />);
    expect(document.querySelector('.hui-metric-card.custom-metric')).toBeInTheDocument();
  });

  it('forwards data-metric-name attribute', () => {
    render(<MetricCard {...baseProps} />);
    const article = document.querySelector('[data-metric-name="total_amount"]');
    expect(article).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLElement>();
    render(<MetricCard {...baseProps} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveClass('hui-metric-card');
  });
});
