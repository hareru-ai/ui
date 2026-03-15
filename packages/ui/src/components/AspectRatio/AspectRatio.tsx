import { forwardRef } from 'react';

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, style, children, ...props }, ref) => (
    <div
      ref={ref}
      style={{ position: 'relative', width: '100%', aspectRatio: String(ratio), ...style }}
      {...props}
    >
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  ),
);
AspectRatio.displayName = 'AspectRatio';
