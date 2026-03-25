'use client';

import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from '@hareru/ui';

export default function PreviewCardDemo() {
  return (
    <PreviewCard>
      <PreviewCardTrigger href="https://ui.hareru.ai" target="_blank">
        @hareru/ui
      </PreviewCardTrigger>
      <PreviewCardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '14rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hareru UI</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--hui-color-muted-foreground)' }}>
            A semantic CSS design system with accessible React components.
          </p>
        </div>
      </PreviewCardContent>
    </PreviewCard>
  );
}
