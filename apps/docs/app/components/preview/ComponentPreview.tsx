'use client';

import { Toaster, TooltipProvider } from '@hareru/ui';
import { Suspense } from 'react';
import { demos } from './demo-registry';
import './ComponentPreview.css';

interface ComponentPreviewProps {
  name: string;
}

export function ComponentPreview({ name }: ComponentPreviewProps) {
  const Demo = demos[name];
  if (!Demo) {
    return (
      <div className="hui-preview-container">
        <p>Demo &quot;{name}&quot; not found.</p>
      </div>
    );
  }

  return (
    <div className="hui-preview-container">
      <div className="hui-root hui-preview-content">
        <TooltipProvider>
          <Suspense fallback={<div style={{ padding: '1rem' }}>Loading preview...</div>}>
            <Demo />
          </Suspense>
          <Toaster />
        </TooltipProvider>
      </div>
    </div>
  );
}
