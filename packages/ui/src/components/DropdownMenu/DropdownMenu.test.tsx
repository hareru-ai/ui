import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './DropdownMenu';

describe('DropdownMenu', () => {
  it('renders trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText('Open menu')).toBeInTheDocument();
  });

  it('trigger is a button', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });

  it('renders DropdownMenuShortcut with merged className', () => {
    render(<DropdownMenuShortcut className="extra">Ctrl+K</DropdownMenuShortcut>);
    const el = screen.getByText('Ctrl+K');
    expect(el).toHaveClass('hui-dropdown-menu__shortcut', 'extra');
  });

  it('renders DropdownMenuLabel', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <button type="button">Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
