'use client';

import { SemanticSuggest } from '@hareru/ui';

export default function SemanticSuggestDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '480px' }}>
      <SemanticSuggest
        type="add_synonym"
        title='Add synonym "revenue" for metric total_amount'
        description='Users frequently use "revenue" but the metric is named "total_amount".'
        evidence={{ queryCount: 24, successRate: 0.42, pattern: '"revenue" → no match' }}
        confidence={0.88}
        onAccept={() => {}}
        onReject={() => {}}
      />
      <SemanticSuggest
        type="add_gotcha"
        title="Clarify that order_count excludes cancelled orders"
        description="Several queries assumed order_count includes all statuses."
        confidence={0.73}
        status="accepted"
      />
      <SemanticSuggest
        type="split_metric"
        title='Split "gmv" into gross_gmv and net_gmv'
        confidence={0.61}
        status="rejected"
      />
    </div>
  );
}
