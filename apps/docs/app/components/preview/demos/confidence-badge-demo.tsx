'use client';

import { ConfidenceBadge } from '@hareru/ui';

export default function ConfidenceBadgeDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <ConfidenceBadge level="authored" score={1.0} />
        <ConfidenceBadge level="validated" score={0.95} />
        <ConfidenceBadge level="reviewed" score={0.78} />
        <ConfidenceBadge level="auto" score={0.52} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <ConfidenceBadge level="authored" size="md" />
        <ConfidenceBadge level="validated" size="md" score={0.95} />
        <ConfidenceBadge level="auto" size="md" showScore={false} />
      </div>
    </div>
  );
}
