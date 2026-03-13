import { type VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const alertVariants = cva('hui-alert', {
  variants: {
    variant: {
      default: 'hui-alert--default',
      destructive: 'hui-alert--destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

// --- Alert ---
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant, className }))} {...props} />
  ),
);
Alert.displayName = 'Alert';

// --- AlertTitle ---
export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h5 ref={ref} className={cn('hui-alert__title', className)} {...props}>
      {children}
    </h5>
  ),
);
AlertTitle.displayName = 'AlertTitle';

// --- AlertDescription ---
export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDescription = forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-alert__description', className)} {...props} />
  ),
);
AlertDescription.displayName = 'AlertDescription';

export { alertVariants };
