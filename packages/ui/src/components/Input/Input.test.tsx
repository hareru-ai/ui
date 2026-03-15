import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders with default styles', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('hui-input');
  });

  it('applies error state', () => {
    render(<Input error placeholder="Error field" />);
    expect(screen.getByPlaceholderText('Error field')).toHaveClass('hui-input--error');
  });

  it('applies file type class', () => {
    render(<Input type="file" data-testid="file-input" />);
    expect(screen.getByTestId('file-input')).toHaveClass('hui-input--file');
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Hello');
    expect(input).toHaveValue('Hello');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('merges custom className', () => {
    render(<Input className="custom" placeholder="Custom" />);
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('hui-input', 'custom');
  });
});
