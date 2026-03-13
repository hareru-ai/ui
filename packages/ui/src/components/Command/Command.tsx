import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- Command (root) ---
export interface CommandProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {}

export const Command = forwardRef<React.ComponentRef<typeof CommandPrimitive>, CommandProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive ref={ref} className={cn('hui-command', className)} {...props} />
  ),
);
Command.displayName = 'Command';

// --- CommandInput ---
export interface CommandInputProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {}

export const CommandInput = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, ...props }, ref) => (
  <div className="hui-command__input-wrapper" cmdk-input-wrapper="">
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
      className="hui-command__search-icon"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <CommandPrimitive.Input ref={ref} className={cn('hui-command__input', className)} {...props} />
  </div>
));
CommandInput.displayName = 'CommandInput';

// --- CommandList ---
export interface CommandListProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {}

export const CommandList = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  CommandListProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List ref={ref} className={cn('hui-command__list', className)} {...props} />
));
CommandList.displayName = 'CommandList';

// --- CommandEmpty ---
export interface CommandEmptyProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {}

export const CommandEmpty = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  CommandEmptyProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty ref={ref} className={cn('hui-command__empty', className)} {...props} />
));
CommandEmpty.displayName = 'CommandEmpty';

// --- CommandGroup ---
export interface CommandGroupProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {}

export const CommandGroup = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  CommandGroupProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group ref={ref} className={cn('hui-command__group', className)} {...props} />
));
CommandGroup.displayName = 'CommandGroup';

// --- CommandSeparator ---
export interface CommandSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> {}

export const CommandSeparator = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('hui-command__separator', className)}
    {...props}
  />
));
CommandSeparator.displayName = 'CommandSeparator';

// --- CommandItem ---
export interface CommandItemProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {}

export const CommandItem = forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item ref={ref} className={cn('hui-command__item', className)} {...props} />
));
CommandItem.displayName = 'CommandItem';

// --- CommandShortcut ---
export interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const CommandShortcut = forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('hui-command__shortcut', className)} {...props} />
  ),
);
CommandShortcut.displayName = 'CommandShortcut';

// --- CommandDialog ---
export interface CommandDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children?: React.ReactNode;
}

export const CommandDialog = ({ children, title = 'Command', ...props }: CommandDialogProps) => (
  <BaseDialog.Root {...props}>
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="hui-command-dialog__overlay" />
      <BaseDialog.Popup className="hui-command-dialog__content" aria-describedby={undefined}>
        <BaseDialog.Title className="hui-sr-only">{title}</BaseDialog.Title>
        <Command className="hui-command-dialog__command">{children}</Command>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  </BaseDialog.Root>
);
CommandDialog.displayName = 'CommandDialog';
