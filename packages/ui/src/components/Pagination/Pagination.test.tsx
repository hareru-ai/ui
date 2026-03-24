import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './Pagination';

function renderPagination() {
  return render(
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="/page/1">Previous</PaginationPrevious>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/page/1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/page/2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/page/3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="/page/3">Next</PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>,
  );
}

describe('Pagination', () => {
  it('renders as nav with aria-label', () => {
    renderPagination();
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toHaveClass('hui-pagination');
  });

  it('merges custom className', () => {
    render(<Pagination className="custom">content</Pagination>);
    expect(screen.getByRole('navigation')).toHaveClass('hui-pagination', 'custom');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLElement>();
    render(<Pagination ref={ref}>content</Pagination>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });
});

describe('PaginationContent', () => {
  it('renders as ul with BEM class', () => {
    renderPagination();
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
    expect(list).toHaveClass('hui-pagination__content');
  });
});

describe('PaginationItem', () => {
  it('renders as li with BEM class', () => {
    renderPagination();
    const items = screen.getAllByRole('listitem');
    for (const item of items) {
      expect(item).toHaveClass('hui-pagination__item');
    }
  });
});

describe('PaginationLink', () => {
  it('renders as anchor with BEM class', () => {
    renderPagination();
    const link = screen.getByText('1');
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('hui-pagination__link');
  });

  it('applies active state with aria-current', () => {
    renderPagination();
    const active = screen.getByText('2');
    expect(active).toHaveAttribute('aria-current', 'page');
    expect(active).toHaveClass('hui-pagination__link--active');
  });

  it('does not set aria-current when not active', () => {
    renderPagination();
    const link = screen.getByText('1');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('applies default size variant (md)', () => {
    render(<PaginationLink href="/test">Test</PaginationLink>);
    expect(screen.getByText('Test')).toHaveClass('hui-pagination__link--md');
  });

  it('applies sm size variant', () => {
    render(
      <PaginationLink href="/test" size="sm">
        Test
      </PaginationLink>,
    );
    expect(screen.getByText('Test')).toHaveClass('hui-pagination__link--sm');
  });

  it('applies lg size variant', () => {
    render(
      <PaginationLink href="/test" size="lg">
        Test
      </PaginationLink>,
    );
    expect(screen.getByText('Test')).toHaveClass('hui-pagination__link--lg');
  });

  it('supports asChild', () => {
    render(
      <PaginationLink asChild isActive>
        <button type="button">Custom</button>
      </PaginationLink>,
    );
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('hui-pagination__link', 'hui-pagination__link--active');
    expect(button).toHaveAttribute('aria-current', 'page');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <PaginationLink ref={ref} href="/test">
        Test
      </PaginationLink>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('merges className', () => {
    render(
      <PaginationLink href="/test" className="extra">
        Test
      </PaginationLink>,
    );
    expect(screen.getByText('Test')).toHaveClass('hui-pagination__link', 'extra');
  });
});

describe('PaginationPrevious', () => {
  it('renders with previous modifier', () => {
    renderPagination();
    const prev = screen.getByText('Previous');
    expect(prev).toHaveClass('hui-pagination__link', 'hui-pagination__link--previous');
  });

  it('renders disabled state as <span>', () => {
    render(<PaginationPrevious disabled>Previous</PaginationPrevious>);
    const prev = screen.getByText('Previous');
    expect(prev.tagName).toBe('SPAN');
    expect(prev).toHaveAttribute('aria-disabled', 'true');
    expect(prev).toHaveAttribute('tabindex', '-1');
    expect(prev).toHaveClass('hui-pagination__link--disabled');
    expect(prev).not.toHaveAttribute('href');
  });

  it('prevents default on click when disabled', () => {
    render(
      <PaginationPrevious disabled href="/page/0">
        Previous
      </PaginationPrevious>,
    );
    const prev = screen.getByText('Previous');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    fireEvent(prev, event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('disabled + asChild: renders as <span> with child text extracted, no nested anchors', () => {
    // When disabled, renders as <span> to avoid nested <a> tags.
    // Child element's text is extracted and rendered directly.
    const { container } = render(
      <PaginationPrevious asChild disabled>
        <a href="/page/0">Previous</a>
      </PaginationPrevious>,
    );
    const span = container.querySelector('span.hui-pagination__link--disabled');
    expect(span).not.toBeNull();
    expect(span?.tagName).toBe('SPAN');
    expect(span).toHaveAttribute('aria-disabled', 'true');
    expect(span).toHaveAttribute('tabindex', '-1');
    expect(span).not.toHaveAttribute('href');
    // No nested <a> inside
    expect(span?.querySelector('a')).toBeNull();
    expect(span?.textContent).toBe('Previous');
  });

  it('disabled + asChild: click is prevented', () => {
    const { container } = render(
      <PaginationPrevious asChild disabled>
        <a href="/page/0">Previous</a>
      </PaginationPrevious>,
    );
    const span = container.querySelector('span.hui-pagination__link--disabled') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    fireEvent(span, event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('PaginationNext', () => {
  it('renders with next modifier', () => {
    renderPagination();
    const next = screen.getByText('Next');
    expect(next).toHaveClass('hui-pagination__link', 'hui-pagination__link--next');
  });

  it('renders disabled state as <span>', () => {
    render(<PaginationNext disabled>Next</PaginationNext>);
    const next = screen.getByText('Next');
    expect(next.tagName).toBe('SPAN');
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveAttribute('tabindex', '-1');
    expect(next).toHaveClass('hui-pagination__link--disabled');
  });
});

describe('PaginationEllipsis', () => {
  it('renders ellipsis with aria-label for screen readers', () => {
    render(<PaginationEllipsis />);
    const ellipsis = screen.getByLabelText('More pages');
    expect(ellipsis).toHaveClass('hui-pagination__ellipsis');
    expect(ellipsis).toHaveAttribute('aria-label', 'More pages');
    // The visible glyph is hidden from AT
    const glyph = ellipsis.querySelector('span[aria-hidden]');
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges className', () => {
    render(<PaginationEllipsis className="extra" />);
    expect(screen.getByLabelText('More pages')).toHaveClass('hui-pagination__ellipsis', 'extra');
  });
});
