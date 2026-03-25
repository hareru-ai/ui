'use client';

import { Toolbar, ToolbarButton, ToolbarLink, ToolbarSeparator } from '@hareru/ui';

export default function ToolbarDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Toolbar>
        <ToolbarButton>New</ToolbarButton>
        <ToolbarButton>Open</ToolbarButton>
        <ToolbarButton>Save</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton variant="outline">Preview</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarLink href="#">Docs</ToolbarLink>
      </Toolbar>

      <Toolbar disabled>
        <ToolbarButton>Undo</ToolbarButton>
        <ToolbarButton>Redo</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton variant="outline">Export</ToolbarButton>
      </Toolbar>
    </div>
  );
}
