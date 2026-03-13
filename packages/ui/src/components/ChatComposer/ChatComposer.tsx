import {
  type ButtonHTMLAttributes,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { cn } from '../../lib/cn';

// --- ChatComposer (form root) ---
export interface ChatComposerProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Whether the composer is disabled */
  disabled?: boolean;
}

export const ChatComposer = forwardRef<HTMLFormElement, ChatComposerProps>(
  ({ className, disabled = false, onSubmit, ...props }, ref) => (
    <form
      ref={ref}
      className={cn('hui-chat-composer', disabled && 'hui-chat-composer--disabled', className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      {...props}
    />
  ),
);
ChatComposer.displayName = 'ChatComposer';

// --- ChatComposerInput (textarea) ---
export interface ChatComposerInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Submit on Enter key (Shift+Enter inserts a newline) */
  submitOnEnter?: boolean;
  /** Callback invoked when the value changes */
  onValueChange?: (value: string) => void;
}

export const ChatComposerInput = forwardRef<HTMLTextAreaElement, ChatComposerInputProps>(
  (
    { className, submitOnEnter = true, onValueChange, onKeyDown, onChange, value, ...props },
    ref,
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, []);

    // Sync forwarded ref + internal ref
    const setRefs = useCallback(
      (el: HTMLTextAreaElement | null) => {
        internalRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      },
      [ref],
    );

    // Auto-resize when controlled value changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: value triggers re-measure on controlled change
    useEffect(() => {
      autoResize(internalRef.current);
    }, [value, autoResize]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (submitOnEnter && e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          e.currentTarget.form?.requestSubmit();
        }
        onKeyDown?.(e);
      },
      [submitOnEnter, onKeyDown],
    );

    return (
      <textarea
        ref={setRefs}
        className={cn('hui-chat-composer__input', className)}
        rows={1}
        value={value}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          autoResize(e.target);
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        {...props}
      />
    );
  },
);
ChatComposerInput.displayName = 'ChatComposerInput';

// --- ChatComposerActions ---
export interface ChatComposerActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const ChatComposerActions = forwardRef<HTMLDivElement, ChatComposerActionsProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-chat-composer__actions', className)} {...props} />
  ),
);
ChatComposerActions.displayName = 'ChatComposerActions';

// --- ChatComposerSend ---
export interface ChatComposerSendProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const ChatComposerSend = forwardRef<HTMLButtonElement, ChatComposerSendProps>(
  ({ className, children, ...props }, ref) => (
    <button ref={ref} type="submit" className={cn('hui-chat-composer__send', className)} {...props}>
      {children ?? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2 8L14 2L8 14L7 9L2 8Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  ),
);
ChatComposerSend.displayName = 'ChatComposerSend';
