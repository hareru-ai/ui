'use client';

import {
  ChatContainer,
  ChatContainerFooter,
  ChatContainerHeader,
  ChatContainerMessages,
  ChatMessage,
  ChatMessageContent,
} from '@hareru/ui';

export default function ChatContainerDemo() {
  return (
    <div style={{ maxWidth: '480px', width: '100%' }}>
      <ChatContainer variant="embedded">
        <ChatContainerHeader>
          <strong>Assistant</strong>
        </ChatContainerHeader>
        <ChatContainerMessages>
          <ChatMessage variant="user">
            <ChatMessageContent>How do I reset my password?</ChatMessageContent>
          </ChatMessage>
          <ChatMessage variant="assistant">
            <ChatMessageContent>
              You can reset your password from the account settings page. Click "Forgot password" on
              the login screen.
            </ChatMessageContent>
          </ChatMessage>
        </ChatContainerMessages>
        <ChatContainerFooter>
          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Type a message...</span>
        </ChatContainerFooter>
      </ChatContainer>
    </div>
  );
}
