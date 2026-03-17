import { Accordion as BaseAccordion } from '@base-ui-components/react/accordion';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- AccordionContent ---
export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, ...props }, ref) => (
    <BaseAccordion.Panel
      ref={ref}
      keepMounted
      className={cn('hui-accordion__content', className)}
      {...props}
    />
  ),
);
AccordionContent.displayName = 'AccordionContent';

// --- AccordionTrigger ---
export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, ...props }, ref) => (
    <BaseAccordion.Trigger
      ref={ref}
      className={cn('hui-accordion__trigger', className)}
      {...props}
    />
  ),
);
AccordionTrigger.displayName = 'AccordionTrigger';

// --- AccordionHeader ---
export interface AccordionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AccordionHeader = forwardRef<HTMLHeadingElement, AccordionHeaderProps>(
  ({ className, ...props }, ref) => (
    <BaseAccordion.Header ref={ref} className={cn('hui-accordion__header', className)} {...props} />
  ),
);
AccordionHeader.displayName = 'AccordionHeader';

// --- AccordionItem ---
export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, onOpenChange, ...props }, ref) => (
    <BaseAccordion.Item
      ref={ref}
      className={cn('hui-accordion__item', className)}
      onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
      {...props}
    />
  ),
);
AccordionItem.displayName = 'AccordionItem';

// --- Accordion ---
export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  type?: 'single' | 'multiple';
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onValueChange?: (value: (string | number)[]) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type, onValueChange, ...props }, ref) => (
    <BaseAccordion.Root
      ref={ref}
      className={cn('hui-accordion', className)}
      multiple={type !== 'single'}
      onValueChange={
        onValueChange ? (value) => onValueChange(value as (string | number)[]) : undefined
      }
      {...props}
    />
  ),
);
Accordion.displayName = 'Accordion';
