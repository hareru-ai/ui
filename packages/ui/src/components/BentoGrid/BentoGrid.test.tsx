import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BentoGrid, BentoGridItem } from './BentoGrid';
import { BENTO_PRESETS } from './presets';

// Mock react-grid-layout — its components require ResizeObserver + DOM measurement
// which happy-dom doesn't support. We test our wrapper layer here.
const mockOnLayoutChange = vi.fn();
const mockOnBreakpointChange = vi.fn();

vi.mock('react-grid-layout', () => ({
  ResponsiveGridLayout: ({
    children,
    dragConfig,
    resizeConfig,
    rowHeight,
    margin,
    onLayoutChange,
    onBreakpointChange,
  }: {
    children: React.ReactNode;
    dragConfig?: { enabled: boolean };
    resizeConfig?: { enabled: boolean };
    rowHeight?: number;
    margin?: [number, number];
    onLayoutChange?: () => void;
    onBreakpointChange?: () => void;
  }) => (
    <div
      data-testid="rgl-mock"
      data-draggable={dragConfig?.enabled}
      data-resizable={resizeConfig?.enabled}
      data-row-height={rowHeight}
      data-margin={margin?.join(',')}
      data-has-layout-cb={!!onLayoutChange}
      data-has-bp-cb={!!onBreakpointChange}
    >
      {children}
    </div>
  ),
  useContainerWidth: () => ({
    width: 1200,
    mounted: true,
    containerRef: { current: null },
    measureWidth: vi.fn(),
  }),
}));

describe('BentoGrid', () => {
  const layouts = {
    lg: [{ i: 'a', x: 0, y: 0, w: 4, h: 2 }],
  };

  it('renders with hui-bento-grid class', () => {
    render(
      <BentoGrid layouts={layouts} data-testid="grid">
        <div key="a">Item A</div>
      </BentoGrid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('hui-bento-grid');
  });

  it('merges custom className', () => {
    render(
      <BentoGrid layouts={layouts} className="custom" data-testid="grid">
        <div key="a">Item A</div>
      </BentoGrid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('hui-bento-grid', 'custom');
  });

  it('renders children through ResponsiveGridLayout', () => {
    render(
      <BentoGrid layouts={layouts}>
        <div key="a">Item A</div>
      </BentoGrid>,
    );

    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByTestId('rgl-mock')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    render(
      <BentoGrid ref={ref} layouts={layouts}>
        <div key="a">A</div>
      </BentoGrid>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes draggable and resizable to ResponsiveGridLayout', () => {
    render(
      <BentoGrid layouts={layouts} draggable resizable>
        <div key="a">A</div>
      </BentoGrid>,
    );

    const rgl = screen.getByTestId('rgl-mock');
    expect(rgl).toHaveAttribute('data-draggable', 'true');
    expect(rgl).toHaveAttribute('data-resizable', 'true');
  });

  it('passes custom rowHeight and gap to ResponsiveGridLayout', () => {
    render(
      <BentoGrid layouts={layouts} rowHeight={100} gap={[8, 8]}>
        <div key="a">A</div>
      </BentoGrid>,
    );

    const rgl = screen.getByTestId('rgl-mock');
    expect(rgl).toHaveAttribute('data-row-height', '100');
    expect(rgl).toHaveAttribute('data-margin', '8,8');
  });

  it('passes callback props to ResponsiveGridLayout', () => {
    render(
      <BentoGrid
        layouts={layouts}
        onLayoutChange={mockOnLayoutChange}
        onBreakpointChange={mockOnBreakpointChange}
      >
        <div key="a">A</div>
      </BentoGrid>,
    );

    const rgl = screen.getByTestId('rgl-mock');
    expect(rgl).toHaveAttribute('data-has-layout-cb', 'true');
    expect(rgl).toHaveAttribute('data-has-bp-cb', 'true');
  });

  it('defaults draggable and resizable to false', () => {
    render(
      <BentoGrid layouts={layouts}>
        <div key="a">A</div>
      </BentoGrid>,
    );

    const rgl = screen.getByTestId('rgl-mock');
    expect(rgl).toHaveAttribute('data-draggable', 'false');
    expect(rgl).toHaveAttribute('data-resizable', 'false');
  });

  it('has correct displayName', () => {
    expect(BentoGrid.displayName).toBe('BentoGrid');
  });
});

describe('BentoGridItem', () => {
  it('renders with hui-bento-grid__item class', () => {
    render(<BentoGridItem data-testid="item">Content</BentoGridItem>);

    const item = screen.getByTestId('item');
    expect(item).toHaveClass('hui-bento-grid__item');
    expect(item.tagName).toBe('DIV');
  });

  it('merges custom className', () => {
    render(
      <BentoGridItem className="custom" data-testid="item">
        Content
      </BentoGridItem>,
    );

    expect(screen.getByTestId('item')).toHaveClass('hui-bento-grid__item', 'custom');
  });

  it('renders as child element with asChild', () => {
    render(
      <BentoGridItem asChild>
        <section data-testid="child">Slot content</section>
      </BentoGridItem>,
    );

    const child = screen.getByTestId('child');
    expect(child.tagName).toBe('SECTION');
    expect(child).toHaveClass('hui-bento-grid__item');
  });

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    render(
      <BentoGridItem ref={ref} data-testid="item">
        Content
      </BentoGridItem>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes through HTML attributes', () => {
    render(
      <BentoGridItem data-testid="item" aria-label="grid item">
        Content
      </BentoGridItem>,
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('aria-label', 'grid item');
  });

  it('has correct displayName', () => {
    expect(BentoGridItem.displayName).toBe('BentoGridItem');
  });
});

describe('BENTO_PRESETS', () => {
  it('exports default preset with breakpoints and cols', () => {
    expect(BENTO_PRESETS.default.breakpoints).toEqual({
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
    });
    expect(BENTO_PRESETS.default.cols).toEqual({
      lg: 12,
      md: 8,
      sm: 4,
      xs: 2,
    });
  });

  it('exports profile preset with breakpoints and cols', () => {
    expect(BENTO_PRESETS.profile.breakpoints).toEqual({
      lg: 1200,
      md: 768,
      sm: 480,
    });
    expect(BENTO_PRESETS.profile.cols).toEqual({
      lg: 6,
      md: 4,
      sm: 2,
    });
  });
});
