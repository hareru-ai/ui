import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  ChatComposer,
  ChatComposerActions,
  ChatComposerInput,
  ChatComposerSend,
} from './ChatComposer';

describe('ChatComposer', () => {
  it('renders as a form', () => {
    const { container } = render(
      <ChatComposer data-testid="form">
        <ChatComposerInput />
        <ChatComposerSend />
      </ChatComposer>,
    );
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('prevents default form submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ChatComposer onSubmit={onSubmit}>
        <ChatComposerInput placeholder="Type..." />
        <ChatComposerSend aria-label="Send" />
      </ChatComposer>,
    );

    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('submits on Enter key', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ChatComposer onSubmit={onSubmit}>
        <ChatComposerInput placeholder="Type..." />
        <ChatComposerSend />
      </ChatComposer>,
    );

    const textarea = screen.getByPlaceholderText('Type...');
    await user.click(textarea);
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ChatComposer onSubmit={onSubmit}>
        <ChatComposerInput placeholder="Type..." />
      </ChatComposer>,
    );

    const textarea = screen.getByPlaceholderText('Type...');
    await user.click(textarea);
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <ChatComposer>
        <ChatComposerInput placeholder="Type..." onValueChange={onValueChange} />
      </ChatComposer>,
    );

    await user.type(screen.getByPlaceholderText('Type...'), 'hi');
    expect(onValueChange).toHaveBeenCalledWith('h');
    expect(onValueChange).toHaveBeenCalledWith('hi');
  });

  it('applies disabled state', () => {
    const { container } = render(
      <ChatComposer disabled>
        <ChatComposerInput />
      </ChatComposer>,
    );
    expect(container.firstChild).toHaveClass('hui-chat-composer--disabled');
  });

  it('renders send button with default icon', () => {
    const { container } = render(<ChatComposerSend aria-label="Send" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders send button with custom children', () => {
    render(<ChatComposerSend>Send</ChatComposerSend>);
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    expect(screen.queryByRole('button')?.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders actions area', () => {
    render(<ChatComposerActions data-testid="actions">Actions</ChatComposerActions>);
    expect(screen.getByTestId('actions')).toHaveClass('hui-chat-composer__actions');
  });

  it('merges custom className', () => {
    const { container } = render(
      <ChatComposer className="custom">
        <ChatComposerInput />
      </ChatComposer>,
    );
    expect(container.firstChild).toHaveClass('hui-chat-composer', 'custom');
  });

  it('does not submit on Enter when submitOnEnter is false', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ChatComposer onSubmit={onSubmit}>
        <ChatComposerInput placeholder="Type..." submitOnEnter={false} />
      </ChatComposer>,
    );

    const textarea = screen.getByPlaceholderText('Type...');
    await user.click(textarea);
    await user.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
