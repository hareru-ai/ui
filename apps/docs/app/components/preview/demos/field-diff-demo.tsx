'use client';

import { FieldDiff } from '@hareru/ui';

export default function FieldDiffDemo() {
  return (
    <div style={{ maxWidth: '400px' }}>
      <FieldDiff
        original={{ name: 'Alice Johnson', email: 'alice@old.com', role: 'Viewer' }}
        corrected={{ name: 'Alice Johnson', email: 'alice@new.com', role: 'Editor' }}
        changedFields={['email', 'role']}
        labels={{ name: 'Name', email: 'Email', role: 'Role' }}
      />
    </div>
  );
}
