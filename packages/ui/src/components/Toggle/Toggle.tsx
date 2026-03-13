import { type VariantProps, cva } from 'class-variance-authority';
import { forwardRef, useCallback, useState } from 'react';
import { cn } from '../../lib/cn';

const toggleVariants = cva('hui-toggle', {
  variants: {
    variant: {
      default: 'hui-toggle--default',
      outline: 'hui-toggle--outline',
    },
    size: {
      sm: 'hui-toggle--sm',
      md: 'hui-toggle--md',
      lg: 'hui-toggle--lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'defaultValue'>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      variant,
      size,
      pressed: controlledPressed,
      defaultPressed = false,
      onPressedChange,
      onClick,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed);
    const isControlled = controlledPressed !== undefined;
    const pressed = isControlled ? controlledPressed : uncontrolledPressed;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        const next = !pressed;
        if (!isControlled) {
          setUncontrolledPressed(next);
        }
        onPressedChange?.(next);
        onClick?.(e);
      },
      [disabled, pressed, isControlled, onPressedChange, onClick],
    );

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        data-state={pressed ? 'on' : 'off'}
        disabled={disabled}
        className={cn(toggleVariants({ variant, size }), className)}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Toggle.displayName = 'Toggle';

export { toggleVariants };
