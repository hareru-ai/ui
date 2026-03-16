import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- CheckboxIndicator ---
/** Internal visual indicator rendered inside Checkbox. Custom styling should use CSS variables. */
export interface CheckboxIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const CheckboxIndicator = forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  ({ className, ...props }, ref) => (
    <BaseCheckbox.Indicator
      ref={ref}
      className={cn('hui-checkbox__indicator', className)}
      keepMounted
      {...props}
    >
      <svg
        className="hui-checkbox__check-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <svg
        className="hui-checkbox__indeterminate-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </BaseCheckbox.Indicator>
  ),
);
CheckboxIndicator.displayName = 'CheckboxIndicator';

// --- Checkbox ---
export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  required?: boolean;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      indeterminate,
      disabled,
      name,
      value,
      required,
      ...props
    },
    ref,
  ) => (
    <BaseCheckbox.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange ? (val) => onCheckedChange(val) : undefined}
      indeterminate={indeterminate}
      disabled={disabled}
      name={name}
      value={value}
      required={required}
      className={cn('hui-checkbox', className)}
      render={<button type="button" disabled={disabled} {...props} />}
    >
      <CheckboxIndicator />
    </BaseCheckbox.Root>
  ),
);
Checkbox.displayName = 'Checkbox';
