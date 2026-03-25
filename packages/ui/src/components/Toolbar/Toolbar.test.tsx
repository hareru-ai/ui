import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarLink, ToolbarSeparator } from './Toolbar';

describe('Toolbar', () => {
  it('renders with BEM class', () => {
    render(
      <Toolbar data-testid="toolbar">
        <ToolbarButton>Bold</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByTestId('toolbar')).toHaveClass('hui-toolbar');
  });

  it('merges className on Toolbar', () => {
    render(
      <Toolbar data-testid="toolbar" className="extra">
        <ToolbarButton>Bold</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByTestId('toolbar')).toHaveClass('hui-toolbar', 'extra');
  });

  it('renders button with BEM class', () => {
    render(
      <Toolbar>
        <ToolbarButton>Bold</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveClass('hui-toolbar__button');
  });

  it('merges className on ToolbarButton', () => {
    render(
      <Toolbar>
        <ToolbarButton className="custom">Bold</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveClass(
      'hui-toolbar__button',
      'custom',
    );
  });

  it('renders group with BEM class', () => {
    render(
      <Toolbar>
        <ToolbarGroup data-testid="group">
          <ToolbarButton>A</ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
    );
    expect(screen.getByTestId('group')).toHaveClass('hui-toolbar__group');
  });

  it('renders separator with BEM class', () => {
    render(
      <Toolbar>
        <ToolbarButton>A</ToolbarButton>
        <ToolbarSeparator data-testid="sep" />
        <ToolbarButton>B</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByTestId('sep')).toHaveClass('hui-toolbar__separator');
  });

  it('renders link with BEM class', () => {
    render(
      <Toolbar>
        <ToolbarLink href="https://example.com">Link</ToolbarLink>
      </Toolbar>,
    );
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveClass('hui-toolbar__link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('orientation vertical sets data attribute', () => {
    render(
      <Toolbar orientation="vertical" data-testid="toolbar">
        <ToolbarButton>A</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByTestId('toolbar')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('orientation horizontal by default', () => {
    render(
      <Toolbar data-testid="toolbar">
        <ToolbarButton>A</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByTestId('toolbar')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('disabled toolbar disables buttons', () => {
    render(
      <Toolbar disabled>
        <ToolbarButton>A</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('individual button disabled', () => {
    render(
      <Toolbar>
        <ToolbarButton disabled>A</ToolbarButton>
        <ToolbarButton>B</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-disabled', 'false');
  });

  it('variant default applies BEM class', () => {
    render(
      <Toolbar>
        <ToolbarButton>A</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('hui-toolbar__button--default');
  });

  it('variant outline applies BEM class', () => {
    render(
      <Toolbar>
        <ToolbarButton variant="outline">A</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('hui-toolbar__button--outline');
  });

  it('size sm applies BEM class', () => {
    render(
      <Toolbar>
        <ToolbarButton size="sm">A</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('hui-toolbar__button--sm');
  });

  it('size lg applies BEM class', () => {
    render(
      <Toolbar>
        <ToolbarButton size="lg">A</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('hui-toolbar__button--lg');
  });

  it('forwards ref on Toolbar', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Toolbar ref={ref}>
        <ToolbarButton>A</ToolbarButton>
      </Toolbar>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref on ToolbarButton', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Toolbar>
        <ToolbarButton ref={ref}>A</ToolbarButton>
      </Toolbar>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('keyboard navigation with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <Toolbar>
        <ToolbarButton>A</ToolbarButton>
        <ToolbarButton>B</ToolbarButton>
        <ToolbarButton>C</ToolbarButton>
      </Toolbar>,
    );
    const btnA = screen.getByRole('button', { name: 'A' });
    btnA.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
  });
});
