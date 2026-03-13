import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from './NavigationMenu';

describe('NavigationMenu', () => {
  const renderNav = () =>
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#">Product 1</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

  it('renders with correct class', () => {
    const { container } = renderNav();
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('hui-navigation-menu');
  });

  it('renders list with correct class', () => {
    const { container } = renderNav();
    const list = container.querySelector('.hui-navigation-menu__list');
    expect(list).toBeInTheDocument();
  });

  it('renders trigger with correct class', () => {
    renderNav();
    const trigger = screen.getByText('Products');
    expect(trigger).toHaveClass('hui-navigation-menu__trigger');
  });

  it('trigger includes chevron icon', () => {
    const { container } = renderNav();
    const chevron = container.querySelector('.hui-navigation-menu__chevron');
    expect(chevron).toBeInTheDocument();
    expect(chevron?.querySelector('svg')).toBeInTheDocument();
  });

  it('merges custom className on NavigationMenu', () => {
    const { container } = render(
      <NavigationMenu className="custom-nav">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('hui-navigation-menu', 'custom-nav');
  });

  it('merges custom className on NavigationMenuList', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList className="custom-list">
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const list = container.querySelector('.hui-navigation-menu__list');
    expect(list).toHaveClass('hui-navigation-menu__list', 'custom-list');
  });

  it('merges custom className on NavigationMenuTrigger', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="custom-trigger">Trigger</NavigationMenuTrigger>
            <NavigationMenuContent>Content</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveClass('hui-navigation-menu__trigger', 'custom-trigger');
  });

  it('forwards ref on NavigationMenu', () => {
    const ref = createRef<HTMLElement>();
    render(
      <NavigationMenu ref={ref}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('forwards ref on NavigationMenuList', () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <NavigationMenu>
        <NavigationMenuList ref={ref}>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Link</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLUListElement);
  });

  it('forwards ref on NavigationMenuTrigger', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger ref={ref}>Trigger</NavigationMenuTrigger>
            <NavigationMenuContent>Content</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders link with correct class', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveClass('hui-navigation-menu__link');
  });

  it('renders root nav element', () => {
    const { container } = renderNav();
    const nav = container.querySelector('.hui-navigation-menu');
    expect(nav).toBeInTheDocument();
    expect(nav?.tagName).toBe('NAV');
  });

  it('NavigationMenuViewport is exported and renderable', () => {
    expect(NavigationMenuViewport).toBeDefined();
    expect(NavigationMenuViewport.displayName).toBe('NavigationMenuViewport');
  });
});
