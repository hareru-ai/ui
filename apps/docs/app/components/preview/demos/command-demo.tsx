'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@hareru/ui';

export default function CommandDemo() {
  return (
    <Command
      style={{
        maxWidth: '22rem',
        border: '1px solid var(--hui-color-border)',
        borderRadius: '0.5rem',
      }}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
          <CommandItem>Launch settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
