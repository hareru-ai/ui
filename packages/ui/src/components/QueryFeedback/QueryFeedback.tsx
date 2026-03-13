import { forwardRef, useCallback, useState } from 'react';
import { cn } from '../../lib/cn';
import './QueryFeedback.css';

export type FeedbackValue = 'helpful' | 'unhelpful';

export interface QueryFeedbackProps
  extends Omit<React.ComponentPropsWithoutRef<'fieldset'>, 'defaultValue'> {
  onFeedback?: (value: FeedbackValue | null) => void;
  value?: FeedbackValue | null;
  defaultValue?: FeedbackValue | null;
  disabled?: boolean;
  helpfulLabel?: string;
  unhelpfulLabel?: string;
}

export const QueryFeedback = forwardRef<HTMLFieldSetElement, QueryFeedbackProps>(
  (props, ref) => {
    const {
      className,
      onFeedback,
      value: controlledValue,
      defaultValue = null,
      disabled = false,
      helpfulLabel = 'Helpful',
      unhelpfulLabel = 'Not helpful',
      ...rest
    } = props;

    const isControlled = 'value' in props;
    const [internalValue, setInternalValue] = useState<FeedbackValue | null>(defaultValue);
    const currentValue = isControlled ? controlledValue : internalValue;

    const handleClick = useCallback(
      (feedbackValue: FeedbackValue) => {
        if (disabled) return;
        const newValue = currentValue === feedbackValue ? null : feedbackValue;
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onFeedback?.(newValue);
      },
      [disabled, currentValue, isControlled, onFeedback],
    );

    const feedbackState = currentValue ?? 'none';

    return (
      <fieldset
        ref={ref}
        className={cn('hui-query-feedback', className)}
        aria-label="Query feedback"
        data-feedback={feedbackState}
        {...rest}
      >
        <button
          type="button"
          className={cn(
            'hui-query-feedback__button',
            'hui-query-feedback__button--helpful',
            currentValue === 'helpful' && 'hui-query-feedback__button--active',
          )}
          onClick={() => handleClick('helpful')}
          disabled={disabled}
          aria-pressed={currentValue === 'helpful'}
          aria-label={helpfulLabel}
          title={helpfulLabel}
        >
          <span aria-hidden="true">{'↑'}</span>
        </button>
        <button
          type="button"
          className={cn(
            'hui-query-feedback__button',
            'hui-query-feedback__button--unhelpful',
            currentValue === 'unhelpful' && 'hui-query-feedback__button--active',
          )}
          onClick={() => handleClick('unhelpful')}
          disabled={disabled}
          aria-pressed={currentValue === 'unhelpful'}
          aria-label={unhelpfulLabel}
          title={unhelpfulLabel}
        >
          <span aria-hidden="true">{'↓'}</span>
        </button>
      </fieldset>
    );
  },
);
QueryFeedback.displayName = 'QueryFeedback';
