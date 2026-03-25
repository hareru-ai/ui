'use client';

import { Textarea } from '@hareru/ui';

export default function TextareaDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '24rem' }}>
      <Textarea placeholder="Write your message here..." rows={3} />
      <Textarea placeholder="Error state" error rows={3} />
      <Textarea placeholder="Disabled textarea" disabled rows={3} />
    </div>
  );
}
