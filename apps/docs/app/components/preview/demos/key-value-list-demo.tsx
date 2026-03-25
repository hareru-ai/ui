'use client';

import { KeyValueList } from '@hareru/ui';

export default function KeyValueListDemo() {
  return (
    <div style={{ maxWidth: '320px' }}>
      <KeyValueList
        items={[
          { label: 'Status', value: 'Active' },
          { label: 'Plan', value: 'Pro' },
          { label: 'Created', value: '2024-01-15' },
        ]}
      />
    </div>
  );
}
