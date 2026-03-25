'use client';

import { BentoGrid, BentoGridItem } from '@hareru/ui';

const layouts = {
  lg: [
    { i: 'a', x: 0, y: 0, w: 6, h: 2 },
    { i: 'b', x: 6, y: 0, w: 6, h: 2 },
    { i: 'c', x: 0, y: 2, w: 4, h: 2 },
    { i: 'd', x: 4, y: 2, w: 8, h: 2 },
  ],
  sm: [
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 },
    { i: 'c', x: 0, y: 2, w: 2, h: 2 },
    { i: 'd', x: 2, y: 2, w: 2, h: 2 },
  ],
};

const items = [
  { key: 'a', label: 'Card A' },
  { key: 'b', label: 'Card B' },
  { key: 'c', label: 'Card C' },
  { key: 'd', label: 'Card D' },
];

export default function BentoGridDemo() {
  return (
    <div style={{ width: '100%' }}>
      <BentoGrid
        layouts={layouts}
        breakpoints={{ lg: 600, sm: 0 }}
        cols={{ lg: 12, sm: 4 }}
        rowHeight={80}
        gap={[12, 12]}
      >
        {items.map((item) => (
          <BentoGridItem key={item.key}>
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--hui-color-muted)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--hui-color-muted-foreground)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {item.label}
            </div>
          </BentoGridItem>
        ))}
      </BentoGrid>
    </div>
  );
}
