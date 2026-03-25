'use client';

import { DataQualityIndicator } from '@hareru/ui';

export default function DataQualityIndicatorDemo() {
  return (
    <div style={{ maxWidth: '400px', width: '100%' }}>
      <DataQualityIndicator
        datasetName="orders"
        overallScore={0.87}
        dimensions={[
          { name: 'completeness', label: 'Completeness', score: 0.95, alertLevel: 'none' },
          {
            name: 'freshness',
            label: 'Freshness',
            score: 0.72,
            alertLevel: 'warning',
            detail: 'No updates for 26 hours',
          },
          { name: 'validity', label: 'Validity', score: 0.91, alertLevel: 'none' },
        ]}
        alerts={[
          { level: 'warning', message: 'No updates for over 24 hours', dimension: 'freshness' },
        ]}
      />
    </div>
  );
}
