import { type VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const badgeVariants = cva('hui-badge', {
  variants: {
    variant: {
      default: 'hui-badge--default',
      secondary: 'hui-badge--secondary',
      destructive: 'hui-badge--destructive',
      outline: 'hui-badge--outline',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <div className={cn(badgeVariants({ variant, className }))} ref={ref} {...props} />;
  },
);
Badge.displayName = 'Badge';

export { badgeVariants };
