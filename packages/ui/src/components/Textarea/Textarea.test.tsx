import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders with default styles', () => {
    render(<Textarea placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('hui-textarea');
  });

  it('renders as textarea element', () => {
    render(<Textarea placeholder="Text" />);
    expect(screen.getByPlaceholderText('Text').tagName).toBe('TEXTAREA');
  });

  it('applies error state', () => {
    render(<Textarea error placeholder="Error field" />);
    expect(screen.getByPlaceholderText('Error field')).toHaveClass('hui-textarea--error');
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Type here" />);
    const textarea = screen.getByPlaceholderText('Type here');
    await user.type(textarea, 'Hello');
    expect(textarea).toHaveValue('Hello');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Textarea disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('merges custom className', () => {
    render(<Textarea className="custom" placeholder="Custom" />);
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('hui-textarea', 'custom');
  });
});
