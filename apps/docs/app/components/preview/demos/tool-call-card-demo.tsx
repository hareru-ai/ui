'use client';

import { ToolCallCard } from '@hareru/ui';

export default function ToolCallCardDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '480px' }}>
      <ToolCallCard
        toolName="query_data"
        status="done"
        args={{ dataset: 'orders', limit: 100 }}
        result="Returned 100 rows"
        duration={342}
        defaultExpanded
      />
      <ToolCallCard toolName="list_metrics" status="executing" />
      <ToolCallCard
        toolName="get_metric_definition"
        status="error"
        error="Metric not found: revenue_total"
      />
    </div>
  );
}
