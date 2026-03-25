'use client';

import { AspectRatio } from '@hareru/ui';

export default function AspectRatioDemo() {
  return (
    <div style={{ width: '100%', maxWidth: '24rem' }}>
      <AspectRatio ratio={16 / 9} style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--hui-color-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--hui-color-muted-foreground)',
            fontSize: '0.875rem',
          }}
        >
          16 / 9
        </div>
      </AspectRatio>
    </div>
  );
}
