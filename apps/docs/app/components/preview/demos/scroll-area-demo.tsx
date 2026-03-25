'use client';

import { ScrollArea } from '@hareru/ui';

const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

export default function ScrollAreaDemo() {
  return (
    <ScrollArea
      style={{
        height: '200px',
        width: '200px',
        border: '1px solid var(--hui-color-border)',
        borderRadius: '0.375rem',
      }}
    >
      <div style={{ padding: '0.75rem' }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              padding: '0.375rem 0',
              fontSize: '0.875rem',
              borderBottom: '1px solid var(--hui-color-border)',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
