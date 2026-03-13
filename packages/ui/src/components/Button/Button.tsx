import { type VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

const buttonVariants = cva('hui-button', {
  variants: {
    variant: {
      default: 'hui-button--default',
      destructive: 'hui-button--destructive',
      outline: 'hui-button--outline',
      secondary: 'hui-button--secondary',
      ghost: 'hui-button--ghost',
      link: 'hui-button--link',
    },
    size: {
      sm: 'hui-button--sm',
      md: 'hui-button--md',
      lg: 'hui-button--lg',
      icon: 'hui-button--icon',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
