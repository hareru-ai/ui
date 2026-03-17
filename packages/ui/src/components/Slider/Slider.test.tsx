import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Slider, SliderOutput, SliderRange, SliderThumb, SliderTrack } from './Slider';

const renderSlider = (props: React.ComponentProps<typeof Slider> = {}) =>
  render(
    <Slider defaultValue={50} {...props}>
      <SliderTrack>
        <SliderRange />
        <SliderThumb />
      </SliderTrack>
    </Slider>,
  );

describe('Slider', () => {
  describe('BEM classes', () => {
    it('renders root with hui-slider class', () => {
      const { container } = renderSlider();
      expect(container.firstChild).toHaveClass('hui-slider');
    });

    it('renders track with hui-slider__track class', () => {
      const { container } = renderSlider();
      expect(container.querySelector('.hui-slider__track')).toBeInTheDocument();
    });

    it('renders control wrapper with hui-slider__control class', () => {
      const { container } = renderSlider();
      expect(container.querySelector('.hui-slider__control')).toBeInTheDocument();
    });

    it('renders range with hui-slider__range class', () => {
      const { container } = renderSlider();
      expect(container.querySelector('.hui-slider__range')).toBeInTheDocument();
    });

    it('renders thumb with hui-slider__thumb class', () => {
      const { container } = renderSlider();
      expect(container.querySelector('.hui-slider__thumb')).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('applies hui-slider--sm modifier for size sm', () => {
      const { container } = renderSlider({ size: 'sm' });
      expect(container.firstChild).toHaveClass('hui-slider--sm');
    });

    it('applies hui-slider--md modifier for size md', () => {
      const { container } = renderSlider({ size: 'md' });
      expect(container.firstChild).toHaveClass('hui-slider--md');
    });

    it('applies hui-slider--lg modifier for size lg', () => {
      const { container } = renderSlider({ size: 'lg' });
      expect(container.firstChild).toHaveClass('hui-slider--lg');
    });

    it('defaults to md size', () => {
      const { container } = renderSlider();
      expect(container.firstChild).toHaveClass('hui-slider--md');
    });
  });

  describe('hidden input', () => {
    it('renders input with role slider inside thumb', () => {
      const { container } = renderSlider();
      const input = container.querySelector('input[type="range"]');
      expect(input).toBeInTheDocument();
    });

    it('input has default min of 0', () => {
      const { container } = renderSlider();
      const input = container.querySelector('input[type="range"]') as HTMLInputElement;
      expect(input).toHaveAttribute('min', '0');
    });

    it('input has default max of 100', () => {
      const { container } = renderSlider();
      const input = container.querySelector('input[type="range"]') as HTMLInputElement;
      expect(input).toHaveAttribute('max', '100');
    });

    it('input reflects defaultValue', () => {
      const { container } = renderSlider({ defaultValue: 40 });
      const input = container.querySelector('input[type="range"]') as HTMLInputElement;
      expect(input).toHaveAttribute('value', '40');
    });
  });

  describe('aria attributes on input', () => {
    // Base UI sets min/max as HTML attributes on the input (not aria-valuemin/max)
    it('sets min attribute on the range input', () => {
      const { container } = renderSlider({ min: 10 });
      const input = container.querySelector('input[type="range"]');
      expect(input).toHaveAttribute('min', '10');
    });

    it('sets max attribute on the range input', () => {
      const { container } = renderSlider({ max: 200 });
      const input = container.querySelector('input[type="range"]');
      expect(input).toHaveAttribute('max', '200');
    });

    it('sets aria-valuenow on the range input', () => {
      const { container } = renderSlider({ defaultValue: 30 });
      const input = container.querySelector('input[type="range"]');
      expect(input).toHaveAttribute('aria-valuenow', '30');
    });
  });

  describe('disabled state', () => {
    it('adds data-disabled attribute when disabled', () => {
      const { container } = renderSlider({ disabled: true });
      const thumb = container.querySelector('.hui-slider__thumb');
      expect(thumb).toHaveAttribute('data-disabled');
    });

    it('input is disabled when slider is disabled', () => {
      const { container } = renderSlider({ disabled: true });
      const input = container.querySelector('input[type="range"]');
      expect(input).toBeDisabled();
    });
  });

  describe('custom className', () => {
    it('merges custom className on root', () => {
      const { container } = renderSlider({ className: 'custom-root' });
      expect(container.firstChild).toHaveClass('hui-slider', 'custom-root');
    });

    it('merges custom className on track', () => {
      const { container } = render(
        <Slider defaultValue={50}>
          <SliderTrack className="custom-track">
            <SliderRange />
            <SliderThumb />
          </SliderTrack>
        </Slider>,
      );
      expect(container.querySelector('.hui-slider__track')).toHaveClass('custom-track');
    });

    it('merges custom className on range', () => {
      const { container } = render(
        <Slider defaultValue={50}>
          <SliderTrack>
            <SliderRange className="custom-range" />
            <SliderThumb />
          </SliderTrack>
        </Slider>,
      );
      expect(container.querySelector('.hui-slider__range')).toHaveClass('custom-range');
    });

    it('merges custom className on thumb', () => {
      const { container } = render(
        <Slider defaultValue={50}>
          <SliderTrack>
            <SliderRange />
            <SliderThumb className="custom-thumb" />
          </SliderTrack>
        </Slider>,
      );
      expect(container.querySelector('.hui-slider__thumb')).toHaveClass('custom-thumb');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to root HTMLDivElement', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Slider defaultValue={50} ref={ref}>
          <SliderTrack>
            <SliderRange />
            <SliderThumb />
          </SliderTrack>
        </Slider>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass('hui-slider');
    });

    it('forwards ref to track HTMLElement', () => {
      const ref = createRef<HTMLElement>();
      render(
        <Slider defaultValue={50}>
          <SliderTrack ref={ref}>
            <SliderRange />
            <SliderThumb />
          </SliderTrack>
        </Slider>,
      );
      expect(ref.current).not.toBeNull();
      expect(ref.current).toHaveClass('hui-slider__track');
    });
  });

  describe('range slider', () => {
    it('renders two thumbs when defaultValue is an array', () => {
      const { container } = render(
        <Slider defaultValue={[25, 75]}>
          <SliderTrack>
            <SliderRange />
            <SliderThumb index={0} />
            <SliderThumb index={1} />
          </SliderTrack>
        </Slider>,
      );
      const thumbs = container.querySelectorAll('.hui-slider__thumb');
      expect(thumbs).toHaveLength(2);
    });

    it('renders two range inputs for range slider', () => {
      const { container } = render(
        <Slider defaultValue={[25, 75]}>
          <SliderTrack>
            <SliderRange />
            <SliderThumb index={0} />
            <SliderThumb index={1} />
          </SliderTrack>
        </Slider>,
      );
      const inputs = container.querySelectorAll('input[type="range"]');
      expect(inputs).toHaveLength(2);
    });
  });
});

describe('SliderOutput', () => {
  it('renders with hui-slider__output class', () => {
    const { container } = render(
      <Slider defaultValue={50}>
        <SliderOutput />
        <SliderTrack>
          <SliderRange />
          <SliderThumb />
        </SliderTrack>
      </Slider>,
    );
    expect(container.querySelector('.hui-slider__output')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(
      <Slider defaultValue={50}>
        <SliderOutput className="custom-output" />
        <SliderTrack>
          <SliderRange />
          <SliderThumb />
        </SliderTrack>
      </Slider>,
    );
    expect(container.querySelector('.hui-slider__output')).toHaveClass('custom-output');
  });

  it('renders children via render function', () => {
    render(
      <Slider defaultValue={50}>
        <SliderOutput>{(_formatted, values) => <span>{values[0]}</span>}</SliderOutput>
        <SliderTrack>
          <SliderRange />
          <SliderThumb />
        </SliderTrack>
      </Slider>,
    );
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('forwards ref to output HTMLOutputElement', () => {
    const ref = createRef<HTMLOutputElement>();
    render(
      <Slider defaultValue={50}>
        <SliderOutput ref={ref} />
        <SliderTrack>
          <SliderRange />
          <SliderThumb />
        </SliderTrack>
      </Slider>,
    );
    expect(ref.current).toBeInstanceOf(HTMLOutputElement);
  });
});

describe('SliderThumb', () => {
  it('forwards ref to thumb HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Slider defaultValue={50}>
        <SliderTrack>
          <SliderRange />
          <SliderThumb ref={ref} />
        </SliderTrack>
      </Slider>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('hui-slider__thumb');
  });

  it('passes getAriaLabel callback to the input', () => {
    const getAriaLabel = vi.fn(() => 'Volume');
    const { container } = render(
      <Slider defaultValue={50}>
        <SliderTrack>
          <SliderRange />
          <SliderThumb getAriaLabel={getAriaLabel} />
        </SliderTrack>
      </Slider>,
    );
    const input = container.querySelector('input[type="range"]');
    expect(input).toHaveAttribute('aria-label', 'Volume');
    expect(getAriaLabel).toHaveBeenCalled();
  });
});
