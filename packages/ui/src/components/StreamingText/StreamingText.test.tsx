import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StreamingText } from './StreamingText';

describe('StreamingText', () => {
  it('renders children', () => {
    render(<StreamingText>Hello world</StreamingText>);
    expect(screen.getByRole('status')).toHaveTextContent('Hello world');
  });

  it('has aria-live="polite"', () => {
    render(<StreamingText>Text</StreamingText>);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('shows cursor when streaming', () => {
    const { container } = render(<StreamingText streaming>Loading...</StreamingText>);
    expect(container.querySelector('.hui-streaming-text__cursor')).toBeInTheDocument();
    expect(container.querySelector('.hui-streaming-text--streaming')).toBeInTheDocument();
  });

  it('hides cursor when not streaming', () => {
    const { container } = render(<StreamingText>Done</StreamingText>);
    expect(container.querySelector('.hui-streaming-text__cursor')).not.toBeInTheDocument();
  });

  it('applies pulse cursor variant', () => {
    const { container } = render(
      <StreamingText streaming cursor="pulse">
        Text
      </StreamingText>,
    );
    expect(container.querySelector('.hui-streaming-text__cursor--pulse')).toBeInTheDocument();
  });

  it('hides cursor when cursor="none"', () => {
    const { container } = render(
      <StreamingText streaming cursor="none">
        Text
      </StreamingText>,
    );
    expect(container.querySelector('.hui-streaming-text__cursor')).not.toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<StreamingText className="custom">Text</StreamingText>);
    expect(screen.getByRole('status')).toHaveClass('hui-streaming-text', 'custom');
  });
});
