import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with checkbox role (default unchecked)', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles checked state on click', async () => {
    const user = userEvent.setup();
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('sets aria-checked to true when checked', () => {
    render(<Checkbox checked />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox');

    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);

    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('supports controlled checked state', () => {
    const { rerender } = render(<Checkbox checked={false} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');

    rerender(<Checkbox checked />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-checked to mixed when indeterminate', () => {
    render(<Checkbox indeterminate />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('forwards ref to the checkbox element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute('role', 'checkbox');
  });

  it('merges custom className with base class', () => {
    render(<Checkbox className="custom-class" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('hui-checkbox');
    expect(checkbox).toHaveClass('custom-class');
  });

  it('has correct BEM class', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('hui-checkbox');
  });

  it('passes name and value to hidden input for form submission', () => {
    const { container } = render(<Checkbox name="agree" value="yes" />);
    const hiddenInput = container.querySelector('input[name="agree"]');
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput).toHaveAttribute('value', 'yes');
  });

  it('transitions from indeterminate to checked on click', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Checkbox indeterminate onCheckedChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');

    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('does not allow type prop to be overridden', () => {
    // @ts-expect-error type is omitted from CheckboxProps
    render(<Checkbox type="submit" />);
  });
});
