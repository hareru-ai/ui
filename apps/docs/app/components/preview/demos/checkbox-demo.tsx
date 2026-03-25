'use client';

import { Checkbox, Label } from '@hareru/ui';
import { useState } from 'react';

export default function CheckboxDemo() {
  const [checked, setChecked] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Checkbox id="terms" checked={checked} onCheckedChange={setChecked} />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Checkbox id="newsletter" defaultChecked />
        <Label htmlFor="newsletter">Subscribe to newsletter</Label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Checkbox id="indeterminate" indeterminate />
        <Label htmlFor="indeterminate">Indeterminate state</Label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Checkbox id="disabled-cb" disabled defaultChecked />
        <Label htmlFor="disabled-cb">Disabled (checked)</Label>
      </div>
    </div>
  );
}
