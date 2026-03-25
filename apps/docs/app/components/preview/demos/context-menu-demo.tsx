'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@hareru/ui';

export default function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          style={{
            display: 'flex',
            height: '8rem',
            width: '20rem',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed var(--hui-color-border)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--hui-color-muted-foreground)',
            userSelect: 'none',
          }}
        >
          Right-click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Back</ContextMenuItem>
        <ContextMenuItem>Forward</ContextMenuItem>
        <ContextMenuItem>Reload</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>View Page Source</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
