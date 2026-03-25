'use client';

import { Skeleton } from '@hareru/ui';

export default function SkeletonDemo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '20rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Skeleton
          style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', flexShrink: 0 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
          <Skeleton style={{ height: '0.875rem', width: '60%', borderRadius: '0.25rem' }} />
          <Skeleton style={{ height: '0.75rem', width: '40%', borderRadius: '0.25rem' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <Skeleton style={{ height: '0.875rem', borderRadius: '0.25rem' }} />
        <Skeleton style={{ height: '0.875rem', borderRadius: '0.25rem' }} />
        <Skeleton style={{ height: '0.875rem', width: '75%', borderRadius: '0.25rem' }} />
      </div>
      <Skeleton style={{ height: '8rem', borderRadius: '0.5rem' }} />
    </div>
  );
}
