import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from './ContextMenu';

describe('ContextMenu', () => {
  it('renders trigger with BEM class', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right-click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByTestId('trigger')).toHaveClass('hui-context-menu__trigger');
  });

  it('trigger renders text content', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right-click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByText('Right-click me')).toBeInTheDocument();
  });

  it('asChild passes BEM class to child', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div data-testid="child">Content</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByTestId('child')).toHaveClass('hui-context-menu__trigger');
  });

  it('asChild merges className with child', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger asChild className="extra">
          <div data-testid="child" className="original">
            Content
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const child = screen.getByTestId('child');
    expect(child).toHaveClass('hui-context-menu__trigger');
  });

  it('renders ContextMenuShortcut with BEM class', () => {
    render(<ContextMenuShortcut>Ctrl+K</ContextMenuShortcut>);
    const el = screen.getByText('Ctrl+K');
    expect(el).toHaveClass('hui-context-menu__shortcut');
  });

  it('ContextMenuShortcut merges className', () => {
    render(<ContextMenuShortcut className="extra">Ctrl+K</ContextMenuShortcut>);
    const el = screen.getByText('Ctrl+K');
    expect(el).toHaveClass('hui-context-menu__shortcut', 'extra');
  });

  it('renders ContextMenuLabel in open menu', () => {
    render(
      <ContextMenu open>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>Actions</ContextMenuLabel>
            <ContextMenuItem>Item</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders ContextMenuSeparator with BEM class', () => {
    render(
      <ContextMenu open>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
          <ContextMenuSeparator data-testid="sep" />
          <ContextMenuItem>Item 2</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByTestId('sep')).toHaveClass('hui-context-menu__separator');
  });

  it('renders menu items in open menu', () => {
    render(
      <ContextMenu open>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Edit</ContextMenuItem>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('trigger merges className', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger" className="custom">
          Content
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByTestId('trigger')).toHaveClass('hui-context-menu__trigger', 'custom');
  });

  it('forwards ref on ContextMenuShortcut', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<ContextMenuShortcut ref={ref}>Ctrl+X</ContextMenuShortcut>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('trigger has tabIndex 0 by default', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right-click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByTestId('trigger')).toHaveAttribute('tabindex', '0');
  });

  it('trigger accepts custom tabIndex', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger" tabIndex={-1}>
          Right-click me
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByTestId('trigger')).toHaveAttribute('tabindex', '-1');
  });
});
