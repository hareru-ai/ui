import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { ReasoningPanel } from './ReasoningPanel';

describe('ReasoningPanel', () => {
  it('renders default done status label', () => {
    render(<ReasoningPanel>content</ReasoningPanel>);
    expect(screen.getByText('Reasoning')).toBeInTheDocument();
  });

  it('renders thinking status label', () => {
    render(<ReasoningPanel status="thinking">content</ReasoningPanel>);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('renders custom summaryLabel', () => {
    render(<ReasoningPanel summaryLabel="Custom Label">content</ReasoningPanel>);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('applies status modifier class', () => {
    const { container } = render(<ReasoningPanel status="thinking">content</ReasoningPanel>);
    expect(container.firstChild).toHaveClass('hui-reasoning-panel--thinking');
  });

  it('is collapsed by default', () => {
    const { container } = render(<ReasoningPanel>hidden content</ReasoningPanel>);
    const details = container.querySelector('details');
    expect(details).not.toHaveAttribute('open');
  });

  it('expands when open prop is set', () => {
    const { container } = render(<ReasoningPanel open>visible content</ReasoningPanel>);
    const details = container.querySelector('details');
    expect(details).toHaveAttribute('open');
  });

  it('reflects open prop changes', () => {
    const { container, rerender } = render(<ReasoningPanel>content</ReasoningPanel>);
    expect(container.querySelector('details')).not.toHaveAttribute('open');

    rerender(<ReasoningPanel open>content</ReasoningPanel>);
    expect(container.querySelector('details')).toHaveAttribute('open');

    rerender(<ReasoningPanel open={false}>content</ReasoningPanel>);
    expect(container.querySelector('details')).not.toHaveAttribute('open');
  });

  it('summary is clickable', async () => {
    const user = userEvent.setup();
    render(<ReasoningPanel>toggle content</ReasoningPanel>);
    const summary = screen.getByText('Reasoning');

    // jsdom does not support native <details> toggle, so we verify
    // the summary element is interactive (click does not throw)
    await user.click(summary);
    expect(summary).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<ReasoningPanel className="custom">content</ReasoningPanel>);
    expect(container.firstChild).toHaveClass('hui-reasoning-panel', 'custom');
  });

  it('forwards ref to details element', () => {
    const ref = createRef<HTMLDetailsElement>();
    render(<ReasoningPanel ref={ref}>content</ReasoningPanel>);
    expect(ref.current).toBeInstanceOf(HTMLDetailsElement);
  });
});
