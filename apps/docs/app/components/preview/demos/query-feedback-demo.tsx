'use client';

import { QueryFeedback } from '@hareru/ui';

export default function QueryFeedbackDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem' }}>Was this response helpful?</span>
        <QueryFeedback onFeedback={(v) => console.log('feedback:', v)} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem' }}>Pre-selected helpful:</span>
        <QueryFeedback value="helpful" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem' }}>Disabled:</span>
        <QueryFeedback disabled />
      </div>
    </div>
  );
}
