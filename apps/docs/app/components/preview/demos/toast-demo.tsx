'use client';

import { Button, toast } from '@hareru/ui';

export default function ToastDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: 'Scheduled',
            description: 'Your meeting has been scheduled for tomorrow.',
          })
        }
      >
        Show toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: 'Something went wrong',
            description: 'Please try again later.',
            variant: 'destructive',
          })
        }
      >
        Show destructive
      </Button>
    </div>
  );
}
