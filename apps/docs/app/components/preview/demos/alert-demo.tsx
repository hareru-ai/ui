'use client';

import { Alert, AlertDescription, AlertTitle } from '@hareru/ui';

export default function AlertDemo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '28rem',
      }}
    >
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the CLI.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again to continue.
        </AlertDescription>
      </Alert>
    </div>
  );
}
