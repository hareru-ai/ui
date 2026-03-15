import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders with switch role (default unchecked)', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles checked state on click', async () => {
    const user = userEvent.setup();
    render(<Switch />);
    const switchElement = screen.getByRole('switch');

    expect(switchElement).toHaveAttribute('aria-checked', 'false');

    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');

    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('has correct role and aria-checked attributes', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('role', 'switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('sets aria-checked to true when checked', () => {
    render(<Switch checked />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(<Switch disabled />);
    const switchElement = screen.getByRole('switch');

    expect(switchElement).toBeDisabled();
    expect(switchElement).toHaveAttribute('aria-checked', 'false');

    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole('switch');

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('forwards ref to the switch element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute('role', 'switch');
  });

  it('merges custom className with base class', () => {
    render(<Switch className="custom-class" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('hui-switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('has correct BEM class', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('hui-switch');
  });
});
