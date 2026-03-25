'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@hareru/ui';

export default function AvatarDemo() {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Avatar>
        <AvatarImage src="https://github.com/hareru-ai.png" alt="Hareru" />
        <AvatarFallback>HA</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  );
}
