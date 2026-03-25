import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui-components/react/checkbox-group';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface CheckboxGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: BaseCheckboxGroup.Props['onValueChange'];
  allValues?: string[];
  disabled?: boolean;
}

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ className, value, defaultValue, onValueChange, allValues, disabled, ...props }, ref) => (
    <BaseCheckboxGroup
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      allValues={allValues}
      disabled={disabled}
      className={cn('hui-checkbox-group', className)}
      {...props}
    />
  ),
);
CheckboxGroup.displayName = 'CheckboxGroup';
