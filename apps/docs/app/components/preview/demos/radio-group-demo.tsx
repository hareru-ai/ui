'use client';

import { RadioGroup, RadioGroupItem } from '@hareru/ui';
import { useState } from 'react';

export default function RadioGroupDemo() {
  const [value, setValue] = useState('standard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RadioGroup value={value} onValueChange={setValue}>
        <RadioGroupItem value="free">Free</RadioGroupItem>
        <RadioGroupItem value="standard">Standard</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
        <RadioGroupItem value="enterprise" disabled>
          Enterprise (contact sales)
        </RadioGroupItem>
      </RadioGroup>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Selected: {value}</p>
    </div>
  );
}
