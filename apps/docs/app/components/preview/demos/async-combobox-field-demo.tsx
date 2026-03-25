'use client';

import { AsyncComboboxField } from '@hareru/ui';

export default function AsyncComboboxFieldDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '20rem' }}>
      <AsyncComboboxField
        label="Search users"
        placeholder="Type to search..."
        fetchUrl="/api/demo/search"
      />

      <AsyncComboboxField
        label="Repository"
        placeholder="Search repositories..."
        fetchUrl="/api/demo/repos"
        required
      />
    </div>
  );
}
