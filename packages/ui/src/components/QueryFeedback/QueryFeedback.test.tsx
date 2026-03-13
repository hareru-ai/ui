import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueryFeedback } from './QueryFeedback';

describe('QueryFeedback', () => {
  it('renders two buttons', () => {
    render(<QueryFeedback />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('renders with role="group"', () => {
    render(<QueryFeedback />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<QueryFeedback ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
    expect(ref.current).toHaveClass('hui-query-feedback');
  });

  it('merges custom className', () => {
    render(<QueryFeedback className="custom-class" />);
    const group = screen.getByRole('group');
    expect(group).toHaveClass('hui-query-feedback', 'custom-class');
  });

  // Uncontrolled mode
  it('toggles helpful on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<QueryFeedback />);
    const helpfulButton = screen.getByLabelText('Helpful');

    await user.click(helpfulButton);
    expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');
    expect(helpfulButton).toHaveClass('hui-query-feedback__button--active');
  });

  it('toggles unhelpful on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<QueryFeedback />);
    const unhelpfulButton = screen.getByLabelText('Not helpful');

    await user.click(unhelpfulButton);
    expect(unhelpfulButton).toHaveAttribute('aria-pressed', 'true');
    expect(unhelpfulButton).toHaveClass('hui-query-feedback__button--active');
  });

  it('deselects when clicking same button again', async () => {
    const user = userEvent.setup();
    render(<QueryFeedback />);
    const helpfulButton = screen.getByLabelText('Helpful');

    await user.click(helpfulButton);
    expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(helpfulButton);
    expect(helpfulButton).toHaveAttribute('aria-pressed', 'false');
    expect(helpfulButton).not.toHaveClass('hui-query-feedback__button--active');
  });

  // Controlled mode
  it('reflects controlled value prop', () => {
    render(<QueryFeedback value="helpful" />);
    const helpfulButton = screen.getByLabelText('Helpful');
    const unhelpfulButton = screen.getByLabelText('Not helpful');

    expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');
    expect(unhelpfulButton).toHaveAttribute('aria-pressed', 'false');
  });

  // Callback
  it('calls onFeedback with correct value', async () => {
    const user = userEvent.setup();
    const handleFeedback = vi.fn();
    render(<QueryFeedback onFeedback={handleFeedback} />);

    await user.click(screen.getByLabelText('Helpful'));
    expect(handleFeedback).toHaveBeenCalledWith('helpful');

    await user.click(screen.getByLabelText('Not helpful'));
    expect(handleFeedback).toHaveBeenCalledWith('unhelpful');
  });

  it('calls onFeedback with null when deselecting', async () => {
    const user = userEvent.setup();
    const handleFeedback = vi.fn();
    render(<QueryFeedback onFeedback={handleFeedback} />);

    await user.click(screen.getByLabelText('Helpful'));
    expect(handleFeedback).toHaveBeenCalledTimes(1);
    expect(handleFeedback).toHaveBeenLastCalledWith('helpful');

    // Click again to deselect
    await user.click(screen.getByLabelText('Helpful'));
    expect(handleFeedback).toHaveBeenCalledTimes(2);
    expect(handleFeedback).toHaveBeenLastCalledWith(null);
  });

  // Disabled
  it('disables buttons when disabled', () => {
    render(<QueryFeedback disabled />);
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });

  it('does not call onFeedback when disabled', async () => {
    const user = userEvent.setup();
    const handleFeedback = vi.fn();
    render(<QueryFeedback disabled onFeedback={handleFeedback} />);

    await user.click(screen.getByLabelText('Helpful'));
    expect(handleFeedback).not.toHaveBeenCalled();
  });

  // Labels
  it('uses custom labels', () => {
    render(<QueryFeedback helpfulLabel="Good" unhelpfulLabel="Bad" />);
    expect(screen.getByLabelText('Good')).toBeInTheDocument();
    expect(screen.getByLabelText('Bad')).toBeInTheDocument();
  });

  // ARIA
  it('sets aria-pressed correctly', () => {
    render(<QueryFeedback defaultValue="unhelpful" />);
    const helpfulButton = screen.getByLabelText('Helpful');
    const unhelpfulButton = screen.getByLabelText('Not helpful');

    expect(helpfulButton).toHaveAttribute('aria-pressed', 'false');
    expect(unhelpfulButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('sets data-feedback attribute', () => {
    const { rerender } = render(<QueryFeedback />);
    expect(screen.getByRole('group')).toHaveAttribute('data-feedback', 'none');

    rerender(<QueryFeedback value="helpful" />);
    expect(screen.getByRole('group')).toHaveAttribute('data-feedback', 'helpful');

    rerender(<QueryFeedback value="unhelpful" />);
    expect(screen.getByRole('group')).toHaveAttribute('data-feedback', 'unhelpful');
  });

  it('has aria-label on the group', () => {
    render(<QueryFeedback />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Query feedback');
  });

  // Controlled rerender
  it('reflects controlled value changes on rerender', () => {
    const { rerender } = render(<QueryFeedback value="helpful" />);
    expect(screen.getByLabelText('Helpful')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Not helpful')).toHaveAttribute('aria-pressed', 'false');

    rerender(<QueryFeedback value="unhelpful" />);
    expect(screen.getByLabelText('Helpful')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByLabelText('Not helpful')).toHaveAttribute('aria-pressed', 'true');
  });

  // Mutual exclusivity (uncontrolled)
  it('switches selection when clicking different button (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<QueryFeedback />);
    const helpfulButton = screen.getByLabelText('Helpful');
    const unhelpfulButton = screen.getByLabelText('Not helpful');

    await user.click(helpfulButton);
    expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');
    expect(unhelpfulButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(unhelpfulButton);
    expect(helpfulButton).toHaveAttribute('aria-pressed', 'false');
    expect(unhelpfulButton).toHaveAttribute('aria-pressed', 'true');
  });

  // defaultValue
  it('initializes with defaultValue="helpful"', () => {
    render(<QueryFeedback defaultValue="helpful" />);
    const helpfulButton = screen.getByLabelText('Helpful');
    expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');
    expect(helpfulButton).toHaveClass('hui-query-feedback__button--active');
  });

  // value={null} is controlled
  it('treats value={null} as controlled', async () => {
    const user = userEvent.setup();
    const handleFeedback = vi.fn();
    render(<QueryFeedback value={null} onFeedback={handleFeedback} />);

    const helpfulButton = screen.getByLabelText('Helpful');
    expect(helpfulButton).toHaveAttribute('aria-pressed', 'false');

    // Click should not change internal state (controlled)
    await user.click(helpfulButton);
    expect(helpfulButton).toHaveAttribute('aria-pressed', 'false');
    expect(handleFeedback).toHaveBeenCalledWith('helpful');
  });

  // Icon aria-hidden
  it('has aria-hidden on icon spans', () => {
    render(<QueryFeedback />);
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      const span = button.querySelector('span');
      expect(span).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
