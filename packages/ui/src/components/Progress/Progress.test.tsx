import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Progress } from './Progress';

describe('Progress', () => {
  it('renders with progressbar role', () => {
    render(<Progress value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
  });

  it('sets aria-valuemin, aria-valuemax, aria-valuenow attributes', () => {
    render(<Progress value={50} max={100} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
  });

  it('sets data-state to indeterminate when value is null', () => {
    render(<Progress value={null} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('data-state', 'indeterminate');
  });

  it('sets data-state to complete when value equals max', () => {
    render(<Progress value={100} max={100} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('data-state', 'complete');
  });

  it('sets data-state to loading when value is between 0 and max', () => {
    render(<Progress value={50} max={100} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('data-state', 'loading');
  });

  it('renders without aria-valuenow when value is not provided', () => {
    render(<Progress />);
    const progress = screen.getByRole('progressbar');
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress).toHaveAttribute('data-state', 'indeterminate');
  });

  it('forwards ref to the progress element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={50} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'progressbar');
  });

  it('merges custom className with base class', () => {
    render(<Progress value={50} className="custom-class" />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('hui-progress');
    expect(progress).toHaveClass('custom-class');
  });

  it('has correct BEM class', () => {
    render(<Progress value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('hui-progress');
  });

  it('renders ProgressIndicator with correct transform style', () => {
    render(<Progress value={75} />);
    const progress = screen.getByRole('progressbar');
    const indicator = progress.querySelector('.hui-progress__indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });
  });

  it('renders ProgressIndicator with 0% transform when value is 100', () => {
    render(<Progress value={100} />);
    const progress = screen.getByRole('progressbar');
    const indicator = progress.querySelector('.hui-progress__indicator');
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
  });

  it('renders ProgressIndicator with 100% transform when value is 0', () => {
    render(<Progress value={0} />);
    const progress = screen.getByRole('progressbar');
    const indicator = progress.querySelector('.hui-progress__indicator');
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  describe('ProgressIndicator', () => {
    it('renders the indicator element inside Progress', () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole('progressbar');
      const indicator = progress.querySelector('.hui-progress__indicator');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('hui-progress__indicator');
    });

    it('has correct BEM class', () => {
      render(<Progress value={50} />);
      const progress = screen.getByRole('progressbar');
      const indicator = progress.querySelector('.hui-progress__indicator');
      expect(indicator).toHaveClass('hui-progress__indicator');
    });
  });
});
