'use client';

import { ChatMessage, ChatMessageContent } from '@hareru/ui';

export default function ChatMessageDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '480px' }}>
      <ChatMessage variant="user">
        <ChatMessageContent>Can you summarize the quarterly report?</ChatMessageContent>
      </ChatMessage>
      <ChatMessage variant="assistant">
        <ChatMessageContent>
          The Q3 report shows a 12% revenue increase year-over-year, with strong performance in the
          enterprise segment.
        </ChatMessageContent>
      </ChatMessage>
      <ChatMessage variant="system">
        <ChatMessageContent>Conversation started</ChatMessageContent>
      </ChatMessage>
    </div>
  );
}
