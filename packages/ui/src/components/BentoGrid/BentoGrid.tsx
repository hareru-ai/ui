import { type HTMLAttributes, forwardRef } from 'react';
import type { Layout, ResponsiveGridLayoutProps, ResponsiveLayouts } from 'react-grid-layout';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { BENTO_PRESETS } from './presets';

export interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Responsive layout definitions */
  layouts: ResponsiveLayouts;
  /** Breakpoint configuration (default: BENTO_PRESETS.default.breakpoints) */
  breakpoints?: Record<string, number>;
  /** Column count configuration (default: BENTO_PRESETS.default.cols) */
  cols?: Record<string, number>;
  /** Row height in px (default: 150) */
  rowHeight?: number;
  /** Gap between items [x, y] in px (default: [16, 16]) */
  gap?: [number, number];
  /** Enable drag */
  draggable?: boolean;
  /** Enable resize */
  resizable?: boolean;
  /** Layout change callback */
  onLayoutChange?: (layout: Layout, allLayouts: ResponsiveLayouts) => void;
  /** Breakpoint change callback */
  onBreakpointChange?: ResponsiveGridLayoutProps['onBreakpointChange'];
  children: React.ReactNode;
}

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  (
    {
      className,
      layouts,
      breakpoints = BENTO_PRESETS.default.breakpoints,
      cols = BENTO_PRESETS.default.cols,
      rowHeight = 150,
      gap = [16, 16],
      draggable = false,
      resizable = false,
      onLayoutChange,
      onBreakpointChange,
      children,
      ...props
    },
    ref,
  ) => {
    const { width, containerRef, mounted } = useContainerWidth();

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn('hui-bento-grid', className)}
        {...props}
      >
        {mounted && (
          <ResponsiveGridLayout
            width={width}
            layouts={layouts}
            breakpoints={breakpoints}
            cols={cols}
            rowHeight={rowHeight}
            margin={gap}
            containerPadding={[0, 0]}
            dragConfig={{ enabled: draggable, bounded: false, threshold: 3 }}
            resizeConfig={{ enabled: resizable, handles: ['se'] }}
            onLayoutChange={onLayoutChange}
            onBreakpointChange={onBreakpointChange}
          >
            {children}
          </ResponsiveGridLayout>
        )}
      </div>
    );
  },
);
BentoGrid.displayName = 'BentoGrid';

export interface BentoGridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Slot pattern: merge props into child element when true */
  asChild?: boolean;
}

export const BentoGridItem = forwardRef<HTMLDivElement, BentoGridItemProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return <Comp ref={ref} className={cn('hui-bento-grid__item', className)} {...props} />;
  },
);
BentoGridItem.displayName = 'BentoGridItem';
