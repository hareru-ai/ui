'use client';

import { DefinitionBrowser } from '@hareru/ui';

export default function DefinitionBrowserDemo() {
  return (
    <div style={{ maxWidth: '480px', width: '100%' }}>
      <DefinitionBrowser
        models={[
          {
            name: 'smb_sales',
            description: 'SMB sales semantic model',
            metricCount: 3,
            dimensionCount: 2,
            validationStatus: 'valid',
          },
        ]}
        metrics={[
          {
            name: 'total_revenue',
            description: 'Sum of all confirmed order amounts',
            semanticModelName: 'smb_sales',
          },
          {
            name: 'order_count',
            description: 'Number of confirmed orders',
            semanticModelName: 'smb_sales',
          },
          {
            name: 'avg_order_value',
            description: 'Average value per order',
            semanticModelName: 'smb_sales',
          },
        ]}
        dimensions={[
          {
            name: 'order_date',
            description: 'Date the order was placed',
            semanticModelName: 'smb_sales',
            isTime: true,
          },
          {
            name: 'customer_segment',
            description: 'Customer segment classification',
            semanticModelName: 'smb_sales',
          },
        ]}
      />
    </div>
  );
}
