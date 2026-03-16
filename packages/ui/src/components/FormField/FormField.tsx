import {
  Children,
  type ReactElement,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
} from 'react';
import { cn } from '../../lib/cn';

// --- Context ---
interface FormFieldContextValue {
  id: string;
  labelId: string;
  descriptionId: string;
  messageId: string;
  error: boolean;
  group: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormField() {
  const ctx = useContext(FormFieldContext);
  if (!ctx) throw new Error('FormField.* must be used within <FormField>');
  return ctx;
}

// --- FormField ---
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
  group?: boolean;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, error = false, group = false, ...props }, ref) => {
    const id = useId();
    return (
      <FormFieldContext.Provider
        value={{
          id,
          labelId: `${id}-label`,
          descriptionId: `${id}-description`,
          messageId: `${id}-message`,
          error,
          group,
        }}
      >
        <div
          ref={ref}
          role={group ? 'group' : undefined}
          aria-labelledby={group ? `${id}-label` : undefined}
          className={cn('hui-form-field', className)}
          {...props}
        />
      </FormFieldContext.Provider>
    );
  },
);
FormField.displayName = 'FormField';

// --- FormFieldLabel ---
export interface FormFieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const FormFieldLabel = forwardRef<HTMLLabelElement, FormFieldLabelProps>(
  ({ className, ...props }, ref) => {
    const { id, error, group } = useFormField();
    if (group) {
      throw new Error(
        'FormFieldLabel must not be used within <FormField group>. Use FormFieldGroupLabel instead.',
      );
    }
    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is dynamically set via FormField context
      <label
        ref={ref}
        htmlFor={id}
        className={cn('hui-form-field__label', error && 'hui-form-field__label--error', className)}
        {...props}
      />
    );
  },
);
FormFieldLabel.displayName = 'FormFieldLabel';

// --- FormFieldGroupLabel ---
export interface FormFieldGroupLabelProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const FormFieldGroupLabel = forwardRef<HTMLSpanElement, FormFieldGroupLabelProps>(
  ({ className, ...props }, ref) => {
    const { labelId, error, group } = useFormField();
    if (!group) {
      throw new Error(
        'FormFieldGroupLabel must be used within <FormField group>. Use FormFieldLabel for non-group fields.',
      );
    }
    return (
      <span
        ref={ref}
        id={labelId}
        className={cn('hui-form-field__label', error && 'hui-form-field__label--error', className)}
        {...props}
      />
    );
  },
);
FormFieldGroupLabel.displayName = 'FormFieldGroupLabel';

// --- FormFieldControl ---
export interface FormFieldControlProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormFieldControl = forwardRef<HTMLDivElement, FormFieldControlProps>(
  ({ className, children, ...props }, ref) => {
    const { id, labelId, descriptionId, messageId, error, group } = useFormField();
    const child = Children.only(children);
    return (
      <div ref={ref} className={cn('hui-form-field__control', className)} {...props}>
        {isValidElement(child)
          ? cloneElement(
              child as ReactElement<{
                id?: string;
                'aria-labelledby'?: string;
                'aria-describedby'?: string;
                'aria-invalid'?: boolean;
              }>,
              // In group mode, aria-labelledby is set on both the wrapper div (role="group")
              // and the child control. Screen readers use the most specific role's label.
              group
                ? {
                    'aria-labelledby': labelId,
                    'aria-describedby': `${descriptionId} ${messageId}`,
                    'aria-invalid': error || undefined,
                  }
                : {
                    id,
                    'aria-describedby': `${descriptionId} ${messageId}`,
                    'aria-invalid': error || undefined,
                  },
            )
          : child}
      </div>
    );
  },
);
FormFieldControl.displayName = 'FormFieldControl';

// --- FormFieldDescription ---
export interface FormFieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormFieldDescription = forwardRef<HTMLParagraphElement, FormFieldDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useFormField();
    return (
      <p
        ref={ref}
        id={descriptionId}
        className={cn('hui-form-field__description', className)}
        {...props}
      />
    );
  },
);
FormFieldDescription.displayName = 'FormFieldDescription';

// --- FormFieldMessage ---
export interface FormFieldMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormFieldMessage = forwardRef<HTMLParagraphElement, FormFieldMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { messageId, error } = useFormField();
    if (!children) return null;
    return (
      <p
        ref={ref}
        id={messageId}
        role={error ? 'alert' : undefined}
        className={cn(
          'hui-form-field__message',
          error && 'hui-form-field__message--error',
          className,
        )}
        {...props}
      >
        {children}
      </p>
    );
  },
);
FormFieldMessage.displayName = 'FormFieldMessage';
