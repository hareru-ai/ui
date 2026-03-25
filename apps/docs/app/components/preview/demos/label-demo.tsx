'use client';

import { Input, Label } from '@hareru/ui';

export default function LabelDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <Label htmlFor="email-demo">Email address</Label>
        <Input id="email-demo" type="email" placeholder="you@example.com" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <Label htmlFor="username-demo">Username</Label>
        <Input id="username-demo" placeholder="johndoe" />
      </div>
    </div>
  );
}
