import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Separator } from './Separator';

describe('Separator', () => {
  it('renders horizontal by default', () => {
    render(<Separator data-testid="sep" />);
    const el = screen.getByTestId('sep');
    expect(el).toHaveClass('hui-separator', 'hui-separator--horizontal');
  });

  it('renders vertical variant', () => {
    render(<Separator data-testid="sep" orientation="vertical" />);
    expect(screen.getByTestId('sep')).toHaveClass('hui-separator--vertical');
  });

  it('has role="none" when decorative', () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveAttribute('role', 'none');
  });

  it('has role="separator" with aria-orientation when not decorative', () => {
    render(<Separator data-testid="sep" decorative={false} orientation="vertical" />);
    const el = screen.getByTestId('sep');
    expect(el).toHaveAttribute('role', 'separator');
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('merges custom className', () => {
    render(<Separator data-testid="sep" className="custom" />);
    expect(screen.getByTestId('sep')).toHaveClass('hui-separator', 'custom');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
