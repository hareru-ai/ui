import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ChatContainer,
  ChatContainerFooter,
  ChatContainerHeader,
  ChatContainerMessages,
} from './ChatContainer';

describe('ChatContainer', () => {
  it('renders a complete chat container', () => {
    render(
      <ChatContainer data-testid="container">
        <ChatContainerHeader>Header</ChatContainerHeader>
        <ChatContainerMessages>Messages</ChatContainerMessages>
        <ChatContainerFooter>Footer</ChatContainerFooter>
      </ChatContainer>,
    );

    expect(screen.getByTestId('container')).toHaveClass('hui-chat-container');
    expect(screen.getByText('Header')).toHaveClass('hui-chat-container__header');
    expect(screen.getByText('Messages')).toHaveClass('hui-chat-container__messages');
    expect(screen.getByText('Footer')).toHaveClass('hui-chat-container__footer');
  });

  it('uses semantic HTML elements', () => {
    render(
      <ChatContainer>
        <ChatContainerHeader data-testid="header">H</ChatContainerHeader>
        <ChatContainerMessages data-testid="messages">M</ChatContainerMessages>
        <ChatContainerFooter data-testid="footer">F</ChatContainerFooter>
      </ChatContainer>,
    );

    expect(screen.getByTestId('header').tagName).toBe('HEADER');
    expect(screen.getByTestId('messages').tagName).toBe('DIV');
    expect(screen.getByTestId('footer').tagName).toBe('FOOTER');
  });

  it('messages area has role="log"', () => {
    render(<ChatContainerMessages>Messages</ChatContainerMessages>);
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('applies embedded variant', () => {
    const { container } = render(<ChatContainer variant="embedded">Content</ChatContainer>);
    expect(container.firstChild).toHaveClass('hui-chat-container--embedded');
  });

  it('merges custom className', () => {
    render(
      <ChatContainer className="custom" data-testid="c">
        Content
      </ChatContainer>,
    );
    expect(screen.getByTestId('c')).toHaveClass('hui-chat-container', 'custom');
  });
});
