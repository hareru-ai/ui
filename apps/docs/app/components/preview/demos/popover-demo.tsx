'use client';

import { Button, Popover, PopoverContent, PopoverTrigger } from '@hareru/ui';

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Dimensions</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--hui-color-muted-foreground)' }}>
            Set the dimensions for the layer.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
