import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './Command';

describe('Command', () => {
  it('renders with correct class', () => {
    render(<Command />);
    expect(document.querySelector('.hui-command')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Command className="custom-command" />);
    const command = document.querySelector('.hui-command');
    expect(command).toHaveClass('hui-command', 'custom-command');
  });

  it('forwards ref on Command', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Command ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('CommandInput renders with search icon', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
      </Command>,
    );
    expect(document.querySelector('.hui-command__search-icon')).toBeInTheDocument();
  });

  it('CommandInput merges className', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." className="custom-input" />
      </Command>,
    );
    const input = document.querySelector('.hui-command__input');
    expect(input).toHaveClass('hui-command__input', 'custom-input');
  });

  it('CommandList renders with class', () => {
    render(
      <Command>
        <CommandList />
      </Command>,
    );
    expect(document.querySelector('.hui-command__list')).toBeInTheDocument();
  });

  it('CommandEmpty shows when no results', () => {
    render(
      <Command>
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('CommandGroup renders with heading', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Group">
            <CommandItem>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('CommandSeparator renders with class', () => {
    render(
      <Command>
        <CommandList>
          <CommandSeparator />
        </CommandList>
      </Command>,
    );
    expect(document.querySelector('.hui-command__separator')).toBeInTheDocument();
  });

  it('CommandItem renders with class', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Apple</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    const item = screen.getByText('Apple');
    expect(item).toHaveClass('hui-command__item');
  });

  it('CommandShortcut renders with class and text', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            Save
            <CommandShortcut>Ctrl+S</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    );
    const shortcut = screen.getByText('Ctrl+S');
    expect(shortcut).toBeInTheDocument();
    expect(shortcut).toHaveClass('hui-command__shortcut');
  });

  it('CommandDialog opens when open prop is true', () => {
    render(
      <CommandDialog open>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
        </CommandList>
      </CommandDialog>,
    );
    expect(document.querySelector('.hui-command-dialog__content')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('CommandDialog renders visually-hidden title', () => {
    render(
      <CommandDialog open>
        <CommandList />
      </CommandDialog>,
    );
    const title = screen.getByText('Command');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('hui-sr-only');
  });

  it('CommandDialog accepts custom title prop', () => {
    render(
      <CommandDialog open title="Search items">
        <CommandList />
      </CommandDialog>,
    );
    expect(screen.getByText('Search items')).toBeInTheDocument();
  });
});
