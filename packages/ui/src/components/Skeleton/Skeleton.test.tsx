import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders with default class', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('hui-skeleton');
  });

  it('has aria-hidden by default', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges custom className', () => {
    render(<Skeleton data-testid="skeleton" className="custom" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('hui-skeleton', 'custom');
  });

  it('supports style for sizing', () => {
    render(<Skeleton data-testid="skeleton" style={{ width: '100px', height: '20px' }} />);
    const el = screen.getByTestId('skeleton');
    expect(el.style.width).toBe('100px');
    expect(el.style.height).toBe('20px');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
