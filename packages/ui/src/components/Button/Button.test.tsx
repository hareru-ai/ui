import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('hui-button', 'hui-button--default', 'hui-button--md');
  });

  it('renders with specified variant and size', () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hui-button--destructive', 'hui-button--lg');
  });

  it('merges custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hui-button', 'custom-class');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders as child element with asChild', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('hui-button');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
