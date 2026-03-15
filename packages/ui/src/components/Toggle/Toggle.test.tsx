import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders with button role', () => {
    render(<Toggle>Toggle</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Toggle' });
    expect(toggle).toBeInTheDocument();
  });

  it('renders with aria-pressed false by default', () => {
    render(<Toggle>Toggle</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Toggle' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles pressed state on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Toggle>Toggle</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Toggle' });

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('data-state', 'off');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAttribute('data-state', 'on');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('data-state', 'off');
  });

  it('respects controlled pressed prop', () => {
    const { rerender } = render(<Toggle pressed={false}>Toggle</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Toggle' });

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('data-state', 'off');

    rerender(<Toggle pressed={true}>Toggle</Toggle>);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAttribute('data-state', 'on');
  });

  it('calls onPressedChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Toggle onPressedChange={handleChange}>Toggle</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Toggle' });

    await user.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(true);

    await user.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(<Toggle disabled>Toggle</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Toggle' });

    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('forwards ref to the toggle element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Toggle ref={ref}>Toggle</Toggle>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.tagName.toLowerCase()).toBe('button');
  });

  it('merges custom className with base class', () => {
    render(<Toggle className="custom-class">Toggle</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Toggle' });
    expect(toggle).toHaveClass('hui-toggle');
    expect(toggle).toHaveClass('custom-class');
  });

  it('has correct BEM class', () => {
    render(<Toggle>Toggle</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Toggle' });
    expect(toggle).toHaveClass('hui-toggle');
  });

  describe('Variants', () => {
    it('applies default variant class', () => {
      render(<Toggle variant="default">Toggle</Toggle>);
      const toggle = screen.getByRole('button', { name: 'Toggle' });
      expect(toggle).toHaveClass('hui-toggle--default');
    });

    it('applies outline variant class', () => {
      render(<Toggle variant="outline">Toggle</Toggle>);
      const toggle = screen.getByRole('button', { name: 'Toggle' });
      expect(toggle).toHaveClass('hui-toggle--outline');
    });

    it('uses default variant when no variant is specified', () => {
      render(<Toggle>Toggle</Toggle>);
      const toggle = screen.getByRole('button', { name: 'Toggle' });
      expect(toggle).toHaveClass('hui-toggle--default');
    });
  });

  describe('Sizes', () => {
    it('applies sm size class', () => {
      render(<Toggle size="sm">Toggle</Toggle>);
      const toggle = screen.getByRole('button', { name: 'Toggle' });
      expect(toggle).toHaveClass('hui-toggle--sm');
    });

    it('applies md size class', () => {
      render(<Toggle size="md">Toggle</Toggle>);
      const toggle = screen.getByRole('button', { name: 'Toggle' });
      expect(toggle).toHaveClass('hui-toggle--md');
    });

    it('applies lg size class', () => {
      render(<Toggle size="lg">Toggle</Toggle>);
      const toggle = screen.getByRole('button', { name: 'Toggle' });
      expect(toggle).toHaveClass('hui-toggle--lg');
    });

    it('uses md size when no size is specified', () => {
      render(<Toggle>Toggle</Toggle>);
      const toggle = screen.getByRole('button', { name: 'Toggle' });
      expect(toggle).toHaveClass('hui-toggle--md');
    });
  });

  describe('Variant + Size combinations', () => {
    it('applies both default variant and sm size', () => {
      render(
        <Toggle variant="default" size="sm">
          Toggle
        </Toggle>,
      );
      const toggle = screen.getByRole('button', { name: 'Toggle' });
      expect(toggle).toHaveClass('hui-toggle--default');
      expect(toggle).toHaveClass('hui-toggle--sm');
    });

    it('applies both outline variant and lg size', () => {
      render(
        <Toggle variant="outline" size="lg">
          Toggle
        </Toggle>,
      );
      const toggle = screen.getByRole('button', { name: 'Toggle' });
      expect(toggle).toHaveClass('hui-toggle--outline');
      expect(toggle).toHaveClass('hui-toggle--lg');
    });
  });
});
