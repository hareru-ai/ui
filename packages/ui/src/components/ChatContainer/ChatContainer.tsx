import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- ChatContainer ---
export interface ChatContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout variant */
  variant?: 'default' | 'embedded';
}

export const ChatContainer = forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'hui-chat-container',
        variant !== 'default' && `hui-chat-container--${variant}`,
        className,
      )}
      {...props}
    />
  ),
);
ChatContainer.displayName = 'ChatContainer';

// --- ChatContainerHeader ---
export interface ChatContainerHeaderProps extends HTMLAttributes<HTMLElement> {}

export const ChatContainerHeader = forwardRef<HTMLElement, ChatContainerHeaderProps>(
  ({ className, ...props }, ref) => (
    <header ref={ref} className={cn('hui-chat-container__header', className)} {...props} />
  ),
);
ChatContainerHeader.displayName = 'ChatContainerHeader';

// --- ChatContainerMessages ---
export interface ChatContainerMessagesProps extends HTMLAttributes<HTMLDivElement> {}

export const ChatContainerMessages = forwardRef<HTMLDivElement, ChatContainerMessagesProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('hui-chat-container__messages', className)}
      {...props}
      role="log"
    />
  ),
);
ChatContainerMessages.displayName = 'ChatContainerMessages';

// --- ChatContainerFooter ---
export interface ChatContainerFooterProps extends HTMLAttributes<HTMLElement> {}

export const ChatContainerFooter = forwardRef<HTMLElement, ChatContainerFooterProps>(
  ({ className, ...props }, ref) => (
    <footer ref={ref} className={cn('hui-chat-container__footer', className)} {...props} />
  ),
);
ChatContainerFooter.displayName = 'ChatContainerFooter';
