import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface FieldDiffProps extends HTMLAttributes<HTMLDivElement> {
  original: Record<string, unknown>;
  corrected: Record<string, unknown>;
  changedFields: string[];
  labels?: Record<string, string>;
}

export const FieldDiff = forwardRef<HTMLDivElement, FieldDiffProps>(
  ({ className, original, corrected, changedFields, labels, ...props }, ref) => {
    const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(corrected)]));

    return (
      <div ref={ref} className={cn('hui-field-diff', className)} {...props}>
        {allKeys.map((key) => {
          const isChanged = changedFields.includes(key);
          const origVal = String(original[key] ?? '');
          const corrVal = String(corrected[key] ?? '');
          const label = labels?.[key] ?? key;

          return (
            <div
              key={key}
              className={cn('hui-field-diff__row', isChanged && 'hui-field-diff__row--changed')}
            >
              <span className="hui-field-diff__label">{label}</span>
              <span
                className={cn(
                  'hui-field-diff__value',
                  isChanged && 'hui-field-diff__value--removed',
                )}
              >
                {origVal}
              </span>
              <span className="hui-field-diff__arrow">{isChanged ? '\u2192' : ''}</span>
              <span
                className={cn('hui-field-diff__value', isChanged && 'hui-field-diff__value--added')}
              >
                {corrVal}
              </span>
            </div>
          );
        })}
      </div>
    );
  },
);
FieldDiff.displayName = 'FieldDiff';
