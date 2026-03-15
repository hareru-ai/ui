import { Switch as BaseSwitch } from '@base-ui-components/react/switch';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- SwitchThumb ---
export interface SwitchThumbProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const SwitchThumb = forwardRef<HTMLSpanElement, SwitchThumbProps>(
  ({ className, ...props }, ref) => (
    <BaseSwitch.Thumb ref={ref} className={cn('hui-switch__thumb', className)} {...props} />
  ),
);
SwitchThumb.displayName = 'SwitchThumb';

// --- Switch ---
export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  name?: string;
  required?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { className, checked, defaultChecked, onCheckedChange, disabled, name, required, ...props },
    ref,
  ) => (
    <BaseSwitch.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange ? (value) => onCheckedChange(value) : undefined}
      disabled={disabled}
      name={name}
      required={required}
      className={cn('hui-switch', className)}
      render={<button type="button" disabled={disabled} {...props} />}
    >
      <SwitchThumb />
    </BaseSwitch.Root>
  ),
);
Switch.displayName = 'Switch';
