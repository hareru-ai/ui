import { cva } from 'class-variance-authority';
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- CVA ---
const chatMessageVariants = cva('hui-chat-message', {
  variants: {
    variant: {
      user: 'hui-chat-message--user',
      assistant: 'hui-chat-message--assistant',
      system: 'hui-chat-message--system',
    },
  },
  defaultVariants: {
    variant: 'user',
  },
});

// --- ChatMessage ---
export interface ChatMessageProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'user' | 'assistant' | 'system';
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(chatMessageVariants({ variant, className }))} {...props} />
  ),
);
ChatMessage.displayName = 'ChatMessage';

// --- ChatMessageContent ---
export interface ChatMessageContentProps extends HTMLAttributes<HTMLDivElement> {}

export const ChatMessageContent = forwardRef<HTMLDivElement, ChatMessageContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-chat-message__content', className)} {...props} />
  ),
);
ChatMessageContent.displayName = 'ChatMessageContent';

// --- ChatMessageTimestamp ---
export interface ChatMessageTimestampProps extends HTMLAttributes<HTMLTimeElement> {
  dateTime?: string;
}

export const ChatMessageTimestamp = forwardRef<HTMLTimeElement, ChatMessageTimestampProps>(
  ({ className, ...props }, ref) => (
    <time ref={ref} className={cn('hui-chat-message__timestamp', className)} {...props} />
  ),
);
ChatMessageTimestamp.displayName = 'ChatMessageTimestamp';

// --- ChatMessageActions ---
export interface ChatMessageActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const ChatMessageActions = forwardRef<HTMLDivElement, ChatMessageActionsProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-chat-message__actions', className)} {...props} />
  ),
);
ChatMessageActions.displayName = 'ChatMessageActions';

export { chatMessageVariants };
