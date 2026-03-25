'use client';

import { ChatComposer, ChatComposerActions, ChatComposerInput, ChatComposerSend } from '@hareru/ui';

export default function ChatComposerDemo() {
  return (
    <div style={{ maxWidth: '480px', width: '100%' }}>
      <ChatComposer>
        <ChatComposerInput placeholder="Ask anything..." />
        <ChatComposerActions>
          <ChatComposerSend />
        </ChatComposerActions>
      </ChatComposer>
    </div>
  );
}
