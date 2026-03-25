'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@hareru/ui';

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem value="getting-started">
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div
              style={{
                padding: '1rem',
                minWidth: '16rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <NavigationMenuLink href="/docs/introduction" closeOnClick>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Introduction</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--hui-color-muted-foreground)' }}>
                  Overview of Hareru UI and its design principles.
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink href="/docs/installation" closeOnClick>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Installation</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--hui-color-muted-foreground)' }}>
                  How to install and set up in your project.
                </div>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div
              style={{
                padding: '1rem',
                minWidth: '16rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <NavigationMenuLink href="/docs/components/button" closeOnClick>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Button</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--hui-color-muted-foreground)' }}>
                  Triggers an action or event.
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink href="/docs/components/input" closeOnClick>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Input</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--hui-color-muted-foreground)' }}>
                  Accepts text input from the user.
                </div>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
