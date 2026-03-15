import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('hui-badge', 'hui-badge--default');
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('hui-badge--secondary');
  });

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText('Destructive');
    expect(badge).toHaveClass('hui-badge--destructive');
  });

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('hui-badge--outline');
  });

  it('merges custom className', () => {
    render(<Badge className="custom-class">Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge).toHaveClass('hui-badge', 'custom-class');
  });

  it('displays children correctly', () => {
    render(<Badge>Badge Text</Badge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('forwards HTML attributes', () => {
    render(<Badge data-testid="badge-test">Test</Badge>);
    expect(screen.getByTestId('badge-test')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Badge ref={ref}>Badge</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('hui-badge');
  });
});
