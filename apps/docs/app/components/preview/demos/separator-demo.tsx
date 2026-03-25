'use client';

import { Separator } from '@hareru/ui';

export default function SeparatorDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={{ marginBottom: '0.75rem' }}>Above the separator</p>
        <Separator />
        <p style={{ marginTop: '0.75rem' }}>Below the separator</p>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          height: '1.25rem',
        }}
      >
        <span>Blog</span>
        <Separator orientation="vertical" />
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Source</span>
      </div>
    </div>
  );
}
