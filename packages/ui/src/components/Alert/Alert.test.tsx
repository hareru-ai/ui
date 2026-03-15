import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from './Alert';

describe('Alert', () => {
  it('renders with default variant', () => {
    render(<Alert>Alert content</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('hui-alert', 'hui-alert--default');
  });

  it('renders destructive variant', () => {
    render(<Alert variant="destructive">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('hui-alert--destructive');
  });

  it('has role="alert"', () => {
    render(<Alert>Test</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Alert className="custom">Test</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('hui-alert', 'custom');
  });
});

describe('AlertTitle', () => {
  it('renders as h5', () => {
    render(<AlertTitle>Title</AlertTitle>);
    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H5');
    expect(title).toHaveClass('hui-alert__title');
  });
});

describe('AlertDescription', () => {
  it('renders with correct class', () => {
    render(<AlertDescription>Description text</AlertDescription>);
    expect(screen.getByText('Description text')).toHaveClass('hui-alert__description');
  });
});
