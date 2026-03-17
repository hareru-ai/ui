import { Slider as BaseSlider } from '@base-ui-components/react/slider';
import { type VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const sliderVariants = cva('hui-slider', {
  variants: {
    size: {
      sm: 'hui-slider--sm',
      md: 'hui-slider--md',
      lg: 'hui-slider--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// --- SliderOutput ---
export interface SliderOutputProps
  extends Omit<React.HTMLAttributes<HTMLOutputElement>, 'children'> {
  children?:
    | ((formattedValues: readonly string[], values: readonly number[]) => React.ReactNode)
    | null;
}

export const SliderOutput = forwardRef<HTMLOutputElement, SliderOutputProps>(
  ({ className, ...props }, ref) => (
    <BaseSlider.Value ref={ref} className={cn('hui-slider__output', className)} {...props} />
  ),
);
SliderOutput.displayName = 'SliderOutput';

// --- SliderThumb ---
export interface SliderThumbProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  disabled?: boolean;
  getAriaLabel?: ((index: number) => string) | null;
  getAriaValueText?: ((formattedValue: string, value: number, index: number) => string) | null;
  inputRef?: React.Ref<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  tabIndex?: number;
}

export const SliderThumb = forwardRef<HTMLDivElement, SliderThumbProps>(
  ({ className, ...props }, ref) => (
    <BaseSlider.Thumb ref={ref} className={cn('hui-slider__thumb', className)} {...props} />
  ),
);
SliderThumb.displayName = 'SliderThumb';

// --- SliderRange ---
export interface SliderRangeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SliderRange = forwardRef<HTMLDivElement, SliderRangeProps>(
  ({ className, ...props }, ref) => (
    <BaseSlider.Indicator ref={ref} className={cn('hui-slider__range', className)} {...props} />
  ),
);
SliderRange.displayName = 'SliderRange';

// --- SliderTrack ---
// Base UI SliderTrack uses RefAttributes<HTMLElement>
export interface SliderTrackProps extends React.HTMLAttributes<HTMLElement> {}

export const SliderTrack = forwardRef<HTMLElement, SliderTrackProps>(
  ({ className, children, ...props }, ref) => (
    <BaseSlider.Control className="hui-slider__control">
      <BaseSlider.Track ref={ref} className={cn('hui-slider__track', className)} {...props}>
        {children}
      </BaseSlider.Track>
    </BaseSlider.Control>
  ),
);
SliderTrack.displayName = 'SliderTrack';

// --- Slider ---
export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'>,
    VariantProps<typeof sliderVariants> {
  value?: number | readonly number[];
  defaultValue?: number | readonly number[];
  onValueChange?: (value: number | readonly number[]) => void;
  onValueCommitted?: (value: number | readonly number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  name?: string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ className, size, children, onValueChange, onValueCommitted, ...props }, ref) => (
    <BaseSlider.Root
      ref={ref}
      className={cn(sliderVariants({ size }), className)}
      onValueChange={
        onValueChange ? (value) => onValueChange(value as number | readonly number[]) : undefined
      }
      onValueCommitted={
        onValueCommitted
          ? (value) => onValueCommitted(value as number | readonly number[])
          : undefined
      }
      {...props}
    >
      {children}
    </BaseSlider.Root>
  ),
);
Slider.displayName = 'Slider';

export { sliderVariants };
