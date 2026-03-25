'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@hareru/ui';
import { useState } from 'react';

export default function CollapsibleDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      style={{
        width: '100%',
        maxWidth: '20rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Keyboard shortcuts</span>
        <CollapsibleTrigger style={{ fontSize: '0.875rem' }}>
          {open ? 'Hide' : 'Show'}
        </CollapsibleTrigger>
      </div>
      <div
        style={{
          background: 'var(--hui-color-muted)',
          borderRadius: '0.375rem',
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
        }}
      >
        ⌘ K — Open command palette
      </div>
      <CollapsibleContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            style={{
              background: 'var(--hui-color-muted)',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
            }}
          >
            ⌘ B — Toggle sidebar
          </div>
          <div
            style={{
              background: 'var(--hui-color-muted)',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
            }}
          >
            ⌘ S — Save file
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
