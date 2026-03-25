'use client';

import { Checkbox, CheckboxGroup, Label } from '@hareru/ui';

export default function CheckboxGroupDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <CheckboxGroup defaultValue={['react', 'typescript']}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox id="react" value="react" />
            <Label htmlFor="react">React</Label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox id="typescript" value="typescript" />
            <Label htmlFor="typescript">TypeScript</Label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox id="vite" value="vite" />
            <Label htmlFor="vite">Vite</Label>
          </div>
        </div>
      </CheckboxGroup>
    </div>
  );
}
