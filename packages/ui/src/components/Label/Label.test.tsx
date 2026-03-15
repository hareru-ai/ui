import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from './Label';

describe('Label', () => {
  it('renders with default styles', () => {
    render(<Label>Username</Label>);
    expect(screen.getByText('Username')).toHaveClass('hui-label');
  });

  it('renders as label element', () => {
    render(<Label>Email</Label>);
    const label = screen.getByText('Email');
    expect(label.tagName).toBe('LABEL');
  });

  it('supports htmlFor prop', () => {
    render(<Label htmlFor="email">Email</Label>);
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email');
  });

  it('merges custom className', () => {
    render(<Label className="custom">Name</Label>);
    expect(screen.getByText('Name')).toHaveClass('hui-label', 'custom');
  });
});
