'use client';

import { Slider, SliderRange, SliderThumb, SliderTrack } from '@hareru/ui';
import { useState } from 'react';

export default function SliderDemo() {
  const [value, setValue] = useState(40);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '20rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span>Volume</span>
          <span>{value}%</span>
        </div>
        <Slider value={value} onValueChange={(v) => setValue(v as number)} min={0} max={100}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem' }}>Default value</span>
        <Slider defaultValue={60} min={0} max={100}>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem' }}>Disabled</span>
        <Slider defaultValue={30} min={0} max={100} disabled>
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </div>
    </div>
  );
}
