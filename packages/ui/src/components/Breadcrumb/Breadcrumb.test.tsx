import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb';

function renderBreadcrumb() {
  return render(
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  );
}

describe('Breadcrumb', () => {
  it('renders as nav with aria-label', () => {
    renderBreadcrumb();
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveClass('hui-breadcrumb');
  });

  it('merges custom className', () => {
    render(<Breadcrumb className="custom">content</Breadcrumb>);
    expect(screen.getByRole('navigation')).toHaveClass('hui-breadcrumb', 'custom');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumb ref={ref}>content</Breadcrumb>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });
});

describe('BreadcrumbList', () => {
  it('renders as ol with BEM class', () => {
    renderBreadcrumb();
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('hui-breadcrumb__list');
  });
});

describe('BreadcrumbItem', () => {
  it('renders as li with BEM class', () => {
    renderBreadcrumb();
    const items = screen.getAllByRole('listitem');
    const contentItems = items.filter((item) => item.classList.contains('hui-breadcrumb__item'));
    expect(contentItems.length).toBeGreaterThanOrEqual(3);
    for (const item of contentItems) {
      expect(item.tagName).toBe('LI');
    }
  });
});

describe('BreadcrumbLink', () => {
  it('renders as anchor with BEM class', () => {
    renderBreadcrumb();
    const link = screen.getByText('Home');
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('hui-breadcrumb__link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('supports asChild with custom element', () => {
    render(
      <BreadcrumbLink asChild>
        <button type="button">Custom</button>
      </BreadcrumbLink>,
    );
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('hui-breadcrumb__link');
  });

  it('merges className with asChild', () => {
    render(
      <BreadcrumbLink asChild className="extra">
        <a href="/test">Test</a>
      </BreadcrumbLink>,
    );
    const link = screen.getByText('Test');
    expect(link).toHaveClass('hui-breadcrumb__link', 'extra');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <BreadcrumbLink ref={ref} href="/test">
        Test
      </BreadcrumbLink>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});

describe('BreadcrumbPage', () => {
  it('renders with aria-current="page"', () => {
    renderBreadcrumb();
    const page = screen.getByText('Current');
    expect(page).toHaveAttribute('aria-current', 'page');
    expect(page).not.toHaveAttribute('aria-disabled');
    expect(page).toHaveClass('hui-breadcrumb__page');
  });

  it('renders as span', () => {
    renderBreadcrumb();
    expect(screen.getByText('Current').tagName).toBe('SPAN');
  });
});

describe('BreadcrumbSeparator', () => {
  it('renders default separator "/"', () => {
    renderBreadcrumb();
    const separators = screen.getAllByText('/');
    expect(separators.length).toBe(2);
    for (const sep of separators) {
      expect(sep).toHaveClass('hui-breadcrumb__separator');
      expect(sep).toHaveAttribute('aria-hidden', 'true');
      expect(sep).toHaveAttribute('role', 'presentation');
    }
  });

  it('renders custom separator', () => {
    render(<BreadcrumbSeparator>&gt;</BreadcrumbSeparator>);
    expect(screen.getByText('>')).toHaveClass('hui-breadcrumb__separator');
  });
});

describe('BreadcrumbEllipsis', () => {
  it('renders ellipsis with aria-label for screen readers', () => {
    render(<BreadcrumbEllipsis />);
    const ellipsis = screen.getByLabelText('More');
    expect(ellipsis).toHaveClass('hui-breadcrumb__ellipsis');
    expect(ellipsis).toHaveAttribute('aria-label', 'More');
    // The visible glyph is hidden from AT
    const glyph = ellipsis.querySelector('span[aria-hidden]');
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges className', () => {
    render(<BreadcrumbEllipsis className="extra" />);
    expect(screen.getByLabelText('More')).toHaveClass('hui-breadcrumb__ellipsis', 'extra');
  });
});
