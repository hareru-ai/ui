import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

describe('RadioGroup', () => {
  it('renders a radiogroup with radio items', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('associates label text with radio via implicit label', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeInTheDocument();
  });

  it('selects an item on click', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
      </RadioGroup>,
    );

    const apple = screen.getByRole('radio', { name: 'Apple' });
    expect(apple).not.toBeChecked();

    await user.click(apple);
    expect(apple).toBeChecked();
  });

  it('calls onValueChange when selection changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioGroup onValueChange={handleChange}>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
      </RadioGroup>,
    );

    await user.click(screen.getByRole('radio', { name: 'Apple' }));
    expect(handleChange).toHaveBeenCalledWith('apple');

    await user.click(screen.getByRole('radio', { name: 'Banana' }));
    expect(handleChange).toHaveBeenCalledWith('banana');
  });

  it('supports controlled value', () => {
    const { rerender } = render(
      <RadioGroup value="apple">
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Banana' })).not.toBeChecked();

    rerender(
      <RadioGroup value="banana">
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeChecked();
  });

  it('disables all items when RadioGroup is disabled', () => {
    render(
      <RadioGroup disabled>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
      </RadioGroup>,
    );
    const radios = screen.getAllByRole('radio');
    for (const radio of radios) {
      expect(radio).toHaveAttribute('aria-disabled', 'true');
    }
  });

  it('disables individual item', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana" disabled>
          Banana
        </RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Apple' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('radio', { name: 'Banana' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('merges custom className on RadioGroup', () => {
    render(
      <RadioGroup className="custom-group">
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toHaveClass('hui-radio-group', 'custom-group');
  });

  it('forwards ref to RadioGroup root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioGroup ref={ref}>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
      </RadioGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'radiogroup');
  });

  it('forwards ref to RadioGroupItem label element', () => {
    const ref = createRef<HTMLLabelElement>();
    render(
      <RadioGroup>
        <RadioGroupItem ref={ref} value="apple">
          Apple
        </RadioGroupItem>
      </RadioGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('navigates with keyboard (arrow keys)', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
        <RadioGroupItem value="cherry">Cherry</RadioGroupItem>
      </RadioGroup>,
    );

    const apple = screen.getByRole('radio', { name: 'Apple' });
    await user.click(apple);
    expect(apple).toBeChecked();

    await user.keyboard('{ArrowDown}');
    const banana = screen.getByRole('radio', { name: 'Banana' });
    expect(banana).toBeChecked();
    expect(banana).toHaveFocus();
  });
});
