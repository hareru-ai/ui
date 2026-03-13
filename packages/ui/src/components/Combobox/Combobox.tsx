import { Popover as BasePopover } from '@base-ui-components/react/popover';
import { Command as CommandPrimitive } from 'cmdk';
import { createContext, forwardRef, useContext, useMemo, useState } from 'react';
import { cn } from '../../lib/cn';

// --- Context ---
interface ComboboxContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ComboboxContext = createContext<ComboboxContextValue>({
  open: false,
  onOpenChange: () => {},
});

const useCombobox = () => useContext(ComboboxContext);

// --- Combobox (root) ---
export interface ComboboxProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback fired when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Initial open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Content elements */
  children: React.ReactNode;
  /** Render as modal (blocks interaction with rest of page) */
  modal?: boolean;
}

export const Combobox = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  children,
  modal: _modal,
}: ComboboxProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const onOpenChange = isControlled ? (controlledOnOpenChange ?? (() => {})) : setUncontrolledOpen;

  const ctx = useMemo(() => ({ open, onOpenChange }), [open, onOpenChange]);

  return (
    <ComboboxContext.Provider value={ctx}>
      <BasePopover.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </BasePopover.Root>
    </ComboboxContext.Provider>
  );
};
Combobox.displayName = 'Combobox';

// --- ComboboxTrigger ---
export interface ComboboxTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ComboboxTrigger = forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  ({ className, ...props }, ref) => (
    <BasePopover.Trigger
      ref={ref}
      role="combobox"
      className={cn('hui-combobox__trigger', className)}
      {...props}
    />
  ),
);
ComboboxTrigger.displayName = 'ComboboxTrigger';

// --- ComboboxContent ---
export interface ComboboxContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ className, children, ...props }, ref) => (
    <BasePopover.Portal>
      <BasePopover.Positioner side="bottom" align="start" sideOffset={4}>
        <BasePopover.Popup ref={ref} className={cn('hui-combobox__content', className)} {...props}>
          <CommandPrimitive className="hui-combobox__command">{children}</CommandPrimitive>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  ),
);
ComboboxContent.displayName = 'ComboboxContent';

// --- ComboboxInput ---
export interface ComboboxInputProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {}

export const ComboboxInput = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  ComboboxInputProps
>(({ className, ...props }, ref) => (
  <div className="hui-combobox__input-wrapper">
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
      className="hui-combobox__search-icon"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <CommandPrimitive.Input ref={ref} className={cn('hui-combobox__input', className)} {...props} />
  </div>
));
ComboboxInput.displayName = 'ComboboxInput';

// --- ComboboxList ---
export interface ComboboxListProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {}

export const ComboboxList = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  ComboboxListProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List ref={ref} className={cn('hui-combobox__list', className)} {...props} />
));
ComboboxList.displayName = 'ComboboxList';

// --- ComboboxItem ---
export interface ComboboxItemProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {}

export const ComboboxItem = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  ComboboxItemProps
>(({ className, onSelect, ...props }, ref) => {
  const { onOpenChange } = useCombobox();
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn('hui-combobox__item', className)}
      onSelect={(value) => {
        onSelect?.(value);
        onOpenChange(false);
      }}
      {...props}
    />
  );
});
ComboboxItem.displayName = 'ComboboxItem';

// --- ComboboxEmpty ---
export interface ComboboxEmptyProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {}

export const ComboboxEmpty = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  ComboboxEmptyProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty ref={ref} className={cn('hui-combobox__empty', className)} {...props} />
));
ComboboxEmpty.displayName = 'ComboboxEmpty';

// --- ComboboxGroup ---
export interface ComboboxGroupProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {}

export const ComboboxGroup = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  ComboboxGroupProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group ref={ref} className={cn('hui-combobox__group', className)} {...props} />
));
ComboboxGroup.displayName = 'ComboboxGroup';
