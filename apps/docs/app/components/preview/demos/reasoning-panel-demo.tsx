'use client';

import { ReasoningPanel } from '@hareru/ui';

export default function ReasoningPanelDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '480px' }}>
      <ReasoningPanel status="done" open>
        <p>
          The user is asking about revenue trends. I should query the orders dataset filtered by
          date range and aggregate by month.
        </p>
        <p>Joining with the products table will allow breakdown by category.</p>
      </ReasoningPanel>
      <ReasoningPanel status="thinking">
        <p>Analyzing the semantic model to identify relevant metrics...</p>
      </ReasoningPanel>
    </div>
  );
}
