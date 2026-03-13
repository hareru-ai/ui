import { Select as BaseSelect } from '@base-ui-components/react/select';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- Root / Group ---
export const Select = BaseSelect.Root;
export const SelectGroup = BaseSelect.Group;

// --- SelectValue ---
export interface SelectValueProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  placeholder?: string;
  children?: React.ReactNode | ((value: unknown) => React.ReactNode);
}

export const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, children, ...props }, ref) => (
    <BaseSelect.Value ref={ref} {...props}>
      {children ??
        ((value: unknown) => (value != null && value !== '' ? String(value) : (placeholder ?? '')))}
    </BaseSelect.Value>
  ),
);
SelectValue.displayName = 'SelectValue';

// --- SelectTrigger ---
export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <BaseSelect.Trigger ref={ref} className={cn('hui-select__trigger', className)} {...props}>
      {children}
      <BaseSelect.Icon className="hui-select__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  ),
);
SelectTrigger.displayName = 'SelectTrigger';

// --- SelectScrollUpArrow (internal) ---
const SelectScrollUpArrow = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <BaseSelect.ScrollUpArrow
      ref={ref}
      className={cn('hui-select__scroll-button', className)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </BaseSelect.ScrollUpArrow>
  ),
);
SelectScrollUpArrow.displayName = 'SelectScrollUpArrow';

// --- SelectScrollDownArrow (internal) ---
const SelectScrollDownArrow = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <BaseSelect.ScrollDownArrow
      ref={ref}
      className={cn('hui-select__scroll-button', className)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </BaseSelect.ScrollDownArrow>
  ),
);
SelectScrollDownArrow.displayName = 'SelectScrollDownArrow';

// --- SelectContent ---
export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => (
    <BaseSelect.Portal>
      <BaseSelect.Positioner>
        <BaseSelect.Popup ref={ref} className={cn('hui-select__content', className)} {...props}>
          <SelectScrollUpArrow />
          <div className="hui-select__viewport">{children}</div>
          <SelectScrollDownArrow />
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  ),
);
SelectContent.displayName = 'SelectContent';

// --- SelectLabel ---
export interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, ...props }, ref) => (
    <BaseSelect.GroupLabel ref={ref} className={cn('hui-select__label', className)} {...props} />
  ),
);
SelectLabel.displayName = 'SelectLabel';

// --- SelectItem ---
export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  disabled?: boolean;
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <BaseSelect.Item ref={ref} className={cn('hui-select__item', className)} {...props}>
      <span className="hui-select__item-indicator">
        <BaseSelect.ItemIndicator keepMounted>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </BaseSelect.ItemIndicator>
      </span>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  ),
);
SelectItem.displayName = 'SelectItem';

// --- SelectSeparator ---
export interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-select__separator', className)} {...props} />
  ),
);
SelectSeparator.displayName = 'SelectSeparator';
