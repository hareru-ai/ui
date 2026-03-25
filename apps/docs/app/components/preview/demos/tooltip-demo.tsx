'use client';

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@hareru/ui';

export default function TooltipDemo() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Top tooltip</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Opens on top</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
