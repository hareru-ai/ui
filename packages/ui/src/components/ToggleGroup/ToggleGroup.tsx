import { Toggle } from '@base-ui-components/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui-components/react/toggle-group';
import { type VariantProps, cva } from 'class-variance-authority';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- CVA variants for ToggleGroupItem ---
const toggleGroupItemVariants = cva('hui-toggle-group__item', {
  variants: {
    variant: {
      default: 'hui-toggle-group__item--default',
      outline: 'hui-toggle-group__item--outline',
    },
    size: {
      sm: 'hui-toggle-group__item--sm',
      md: 'hui-toggle-group__item--md',
      lg: 'hui-toggle-group__item--lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

// --- ToggleGroup ---
export interface ToggleGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  multiple?: BaseToggleGroup.Props['multiple'];
  value?: BaseToggleGroup.Props['value'];
  defaultValue?: BaseToggleGroup.Props['defaultValue'];
  onValueChange?: BaseToggleGroup.Props['onValueChange'];
  disabled?: BaseToggleGroup.Props['disabled'];
  orientation?: BaseToggleGroup.Props['orientation'];
  loopFocus?: BaseToggleGroup.Props['loopFocus'];
}

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      className,
      multiple,
      value,
      defaultValue,
      onValueChange,
      disabled,
      orientation = 'horizontal',
      loopFocus,
      ...props
    },
    ref,
  ) => (
    <BaseToggleGroup
      ref={ref}
      className={cn('hui-toggle-group', className)}
      multiple={multiple}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      orientation={orientation}
      loopFocus={loopFocus}
      {...props}
    />
  ),
);
ToggleGroup.displayName = 'ToggleGroup';

// --- ToggleGroupItem ---
export interface ToggleGroupItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'>,
    VariantProps<typeof toggleGroupItemVariants> {
  value: string;
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, variant, size, value, ...props }, ref) => (
    <Toggle
      ref={ref}
      className={cn(toggleGroupItemVariants({ variant, size }), className)}
      value={value}
      {...props}
    />
  ),
);
ToggleGroupItem.displayName = 'ToggleGroupItem';

export { toggleGroupItemVariants };
