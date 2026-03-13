import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export const Card = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <article ref={ref} className={cn('hui-card', className)} {...props} />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header ref={ref} className={cn('hui-card__header', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('hui-card__title', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('hui-card__description', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('hui-card__content', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <footer ref={ref} className={cn('hui-card__footer', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';
