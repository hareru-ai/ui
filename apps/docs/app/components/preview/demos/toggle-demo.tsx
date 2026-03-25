'use client';

import { Toggle } from '@hareru/ui';

export default function ToggleDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Toggle>Default</Toggle>
      <Toggle defaultPressed>Pressed</Toggle>
      <Toggle variant="outline">Outline</Toggle>
      <Toggle variant="outline" defaultPressed>
        Outline Pressed
      </Toggle>
      <Toggle size="sm">Small</Toggle>
      <Toggle size="lg">Large</Toggle>
      <Toggle disabled>Disabled</Toggle>
    </div>
  );
}
