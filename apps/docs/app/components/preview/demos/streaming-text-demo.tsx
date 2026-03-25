'use client';

import { StreamingText } from '@hareru/ui';

export default function StreamingTextDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>
          Completed (streaming=false)
        </p>
        <StreamingText streaming={false}>
          The analysis is complete. All metrics are within expected ranges.
        </StreamingText>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>
          Streaming with blink cursor
        </p>
        <StreamingText streaming cursor="blink">
          Generating response
        </StreamingText>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>
          Streaming with pulse cursor
        </p>
        <StreamingText streaming cursor="pulse">
          Loading data
        </StreamingText>
      </div>
    </div>
  );
}
