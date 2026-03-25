'use client';

import { ReadonlyField } from '@hareru/ui';

export default function ReadonlyFieldDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '320px' }}>
      <ReadonlyField label="Full Name" value="Alice Johnson" />
      <ReadonlyField label="Email" value="alice@example.com" />
      <ReadonlyField label="Department" value="Engineering" />
    </div>
  );
}
