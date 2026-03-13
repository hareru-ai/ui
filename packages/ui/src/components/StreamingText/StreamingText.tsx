import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface StreamingTextProps extends HTMLAttributes<HTMLOutputElement> {
  /** Whether text is currently streaming */
  streaming?: boolean;
  /** Cursor animation style */
  cursor?: 'blink' | 'pulse' | 'none';
}

export const StreamingText = forwardRef<HTMLOutputElement, StreamingTextProps>(
  ({ className, streaming = false, cursor = 'blink', children, ...props }, ref) => (
    <output
      ref={ref}
      className={cn('hui-streaming-text', streaming && 'hui-streaming-text--streaming', className)}
      aria-live="polite"
      {...props}
    >
      {children}
      {streaming && cursor !== 'none' && (
        <span
          className={cn('hui-streaming-text__cursor', `hui-streaming-text__cursor--${cursor}`)}
          aria-hidden="true"
        />
      )}
    </output>
  ),
);
StreamingText.displayName = 'StreamingText';
