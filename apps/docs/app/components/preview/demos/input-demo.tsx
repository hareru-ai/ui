'use client';

import { Input, Label } from '@hareru/ui';

export default function InputDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '20rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Label htmlFor="disabled">Disabled</Label>
        <Input id="disabled" placeholder="Disabled input" disabled />
      </div>
    </div>
  );
}
