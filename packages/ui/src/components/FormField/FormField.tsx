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
  descriptionId: string;
  messageId: string;
  error: boolean;
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
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, error = false, ...props }, ref) => {
    const id = useId();
    return (
      <FormFieldContext.Provider
        value={{
          id,
          descriptionId: `${id}-description`,
          messageId: `${id}-message`,
          error,
        }}
      >
        <div ref={ref} className={cn('hui-form-field', className)} {...props} />
      </FormFieldContext.Provider>
    );
  },
);
FormField.displayName = 'FormField';

// --- FormFieldLabel ---
export interface FormFieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const FormFieldLabel = forwardRef<HTMLLabelElement, FormFieldLabelProps>(
  ({ className, ...props }, ref) => {
    const { id, error } = useFormField();
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

// --- FormFieldControl ---
export interface FormFieldControlProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormFieldControl = forwardRef<HTMLDivElement, FormFieldControlProps>(
  ({ className, children, ...props }, ref) => {
    const { id, descriptionId, messageId, error } = useFormField();
    const child = Children.only(children);
    return (
      <div ref={ref} className={cn('hui-form-field__control', className)} {...props}>
        {isValidElement(child)
          ? cloneElement(
              child as ReactElement<{
                id?: string;
                'aria-describedby'?: string;
                'aria-invalid'?: boolean;
              }>,
              {
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
