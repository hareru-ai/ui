import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ChatMessage,
  ChatMessageActions,
  ChatMessageContent,
  ChatMessageTimestamp,
} from './ChatMessage';

describe('ChatMessage', () => {
  it('renders with user variant', () => {
    const { container } = render(
      <ChatMessage variant="user">
        <ChatMessageContent>Hello</ChatMessageContent>
      </ChatMessage>,
    );
    expect(container.firstChild).toHaveClass('hui-chat-message', 'hui-chat-message--user');
  });

  it('renders with assistant variant', () => {
    const { container } = render(
      <ChatMessage variant="assistant">
        <ChatMessageContent>Hi there</ChatMessageContent>
      </ChatMessage>,
    );
    expect(container.firstChild).toHaveClass('hui-chat-message--assistant');
  });

  it('renders with system variant', () => {
    const { container } = render(
      <ChatMessage variant="system">
        <ChatMessageContent>System message</ChatMessageContent>
      </ChatMessage>,
    );
    expect(container.firstChild).toHaveClass('hui-chat-message--system');
  });

  it('renders all sub-components', () => {
    render(
      <ChatMessage variant="user">
        <ChatMessageContent>Content</ChatMessageContent>
        <ChatMessageTimestamp dateTime="2024-01-01">1m ago</ChatMessageTimestamp>
        <ChatMessageActions data-testid="actions">
          <button type="button">Copy</button>
        </ChatMessageActions>
      </ChatMessage>,
    );

    expect(screen.getByText('Content')).toHaveClass('hui-chat-message__content');
    expect(screen.getByText('1m ago')).toHaveClass('hui-chat-message__timestamp');
    expect(screen.getByTestId('actions')).toHaveClass('hui-chat-message__actions');
  });

  it('timestamp renders as time element', () => {
    render(
      <ChatMessageTimestamp dateTime="2024-01-01" data-testid="ts">
        1m ago
      </ChatMessageTimestamp>,
    );
    expect(screen.getByTestId('ts').tagName).toBe('TIME');
    expect(screen.getByTestId('ts')).toHaveAttribute('dateTime', '2024-01-01');
  });

  it('merges custom className', () => {
    const { container } = render(
      <ChatMessage variant="user" className="custom">
        Content
      </ChatMessage>,
    );
    expect(container.firstChild).toHaveClass('hui-chat-message', 'custom');
  });
});
