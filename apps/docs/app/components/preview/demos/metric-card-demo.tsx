'use client';

import { MetricCard } from '@hareru/ui';

export default function MetricCardDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <MetricCard
        metricName="total_revenue"
        displayName="Total Revenue"
        value={1284750}
        unit="USD"
        description="Sum of all confirmed orders"
        confidence={0.97}
        semanticModelName="smb_sales"
        freshness={{
          lastUpdatedAt: new Date('2026-03-25T08:00:00'),
          staleness: 'fresh',
          label: 'Updated 2h ago',
        }}
      />
      <MetricCard
        metricName="active_users"
        displayName="Active Users"
        value={4821}
        description="Monthly active users"
        confidence={0.82}
        semanticModelName="user_analytics"
        freshness={{
          lastUpdatedAt: new Date('2026-03-24T00:00:00'),
          staleness: 'stale',
        }}
      />
      <MetricCard
        metricName="conversion_rate"
        displayName="Conversion Rate"
        value={null}
        loading
        semanticModelName="funnels"
      />
    </div>
  );
}
