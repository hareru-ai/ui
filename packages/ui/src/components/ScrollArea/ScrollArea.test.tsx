import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScrollArea, ScrollBar } from './ScrollArea';

describe('ScrollArea', () => {
  it('renders children', () => {
    render(
      <ScrollArea style={{ height: 200 }}>
        <p>Scroll content</p>
      </ScrollArea>,
    );
    expect(screen.getByText('Scroll content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ScrollArea className="custom-scroll">
        <p>Content</p>
      </ScrollArea>,
    );
    expect(container.firstElementChild).toHaveClass('hui-scroll-area', 'custom-scroll');
  });

  it('renders viewport element', () => {
    const { container } = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    expect(container.querySelector('.hui-scroll-area__viewport')).toBeInTheDocument();
  });

  it('sets displayName', () => {
    expect(ScrollArea.displayName).toBe('ScrollArea');
    expect(ScrollBar.displayName).toBe('ScrollBar');
  });
});
