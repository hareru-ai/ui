'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@hareru/ui';
import { useState } from 'react';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Orange' },
];

export default function ComboboxDemo() {
  const [selected, setSelected] = useState('');

  return (
    <Combobox>
      <ComboboxTrigger>{selected || 'Select a fruit...'}</ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Search fruits..." />
        <ComboboxList>
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
          {fruits.map((fruit) => (
            <ComboboxItem
              key={fruit.value}
              value={fruit.value}
              onSelect={() => setSelected(fruit.label)}
            >
              {fruit.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
