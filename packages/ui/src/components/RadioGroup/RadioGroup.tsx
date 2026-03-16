import { Radio as BaseRadio } from '@base-ui-components/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui-components/react/radio-group';
import { forwardRef, useId } from 'react';
import { cn } from '../../lib/cn';

// --- RadioGroupItemIndicator ---
export interface RadioGroupItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const RadioGroupItemIndicator = forwardRef<HTMLSpanElement, RadioGroupItemIndicatorProps>(
  ({ className, ...props }, ref) => (
    <BaseRadio.Indicator
      ref={ref}
      className={cn('hui-radio-group-item__indicator', className)}
      {...props}
    />
  ),
);
RadioGroupItemIndicator.displayName = 'RadioGroupItemIndicator';

// --- RadioGroupItem ---
// <label> for implicit label association — children serve as the label text
export interface RadioGroupItemProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> {
  value: string;
  disabled?: boolean;
}

export const RadioGroupItem = forwardRef<HTMLLabelElement, RadioGroupItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const labelId = useId();
    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: Base UI Radio.Root renders a hidden input inside this label
      <label
        ref={ref}
        className={cn(
          'hui-radio-group-item',
          disabled && 'hui-radio-group-item--disabled',
          className,
        )}
        {...props}
      >
        <BaseRadio.Root
          value={value}
          disabled={disabled}
          className="hui-radio-group-item__control"
          aria-labelledby={children ? labelId : undefined}
        >
          <RadioGroupItemIndicator />
        </BaseRadio.Root>
        {children && (
          <span id={labelId} className="hui-radio-group-item__label">
            {children}
          </span>
        )}
      </label>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';

// --- RadioGroup ---
export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    { className, children, value, defaultValue, onValueChange, name, required, disabled, ...props },
    ref,
  ) => (
    <BaseRadioGroup
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (val) => onValueChange(val as string) : undefined}
      name={name}
      required={required}
      disabled={disabled}
      className={cn('hui-radio-group', className)}
      {...props}
    >
      {children}
    </BaseRadioGroup>
  ),
);
RadioGroup.displayName = 'RadioGroup';
