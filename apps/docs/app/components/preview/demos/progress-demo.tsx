'use client';

import { Progress } from '@hareru/ui';

export default function ProgressDemo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '20rem',
      }}
    >
      <Progress value={60} />
      <Progress value={25} />
      <Progress value={90} />
    </div>
  );
}
