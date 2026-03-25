'use client';

import { ApprovalCard } from '@hareru/ui';

export default function ApprovalCardDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
      <ApprovalCard
        title="Deploy to Production"
        description="This will deploy version 2.4.1 to the production environment."
        status="pending"
        risk="low"
        onApprove={() => {}}
        onReject={() => {}}
      />
      <ApprovalCard
        title="Delete Customer Records"
        description="Permanently delete 1,200 inactive customer records."
        status="approved"
        risk="high"
      />
      <ApprovalCard
        title="Send Email Campaign"
        description="Send promotional email to 50,000 subscribers."
        status="rejected"
        risk="medium"
      />
    </div>
  );
}
