'use client';

import { ToggleGroup, ToggleGroupItem } from '@hareru/ui';

export default function ToggleGroupDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ToggleGroup defaultValue={['center']}>
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup defaultValue={['bold']} multiple>
        <ToggleGroupItem value="bold" variant="outline">
          Bold
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" variant="outline">
          Italic
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" variant="outline">
          Underline
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup defaultValue={['md']}>
        <ToggleGroupItem value="sm" size="sm">
          S
        </ToggleGroupItem>
        <ToggleGroupItem value="md" size="sm">
          M
        </ToggleGroupItem>
        <ToggleGroupItem value="lg" size="sm">
          L
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
