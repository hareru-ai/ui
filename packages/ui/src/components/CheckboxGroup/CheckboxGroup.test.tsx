import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../Checkbox/Checkbox';
import { Label } from '../Label/Label';
import { CheckboxGroup } from './CheckboxGroup';

describe('CheckboxGroup', () => {
  it('renders with BEM class', () => {
    render(
      <CheckboxGroup data-testid="group">
        <Checkbox value="a" />
      </CheckboxGroup>,
    );
    expect(screen.getByTestId('group')).toHaveClass('hui-checkbox-group');
  });

  it('merges className', () => {
    render(
      <CheckboxGroup data-testid="group" className="extra">
        <Checkbox value="a" />
      </CheckboxGroup>,
    );
    expect(screen.getByTestId('group')).toHaveClass('hui-checkbox-group', 'extra');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <CheckboxGroup ref={ref}>
        <Checkbox value="a" />
      </CheckboxGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders children checkboxes', () => {
    render(
      <CheckboxGroup>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox renders hidden input inside label */}
        <label>
          <Checkbox value="apple" />
          Apple
        </label>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox renders hidden input inside label */}
        <label>
          <Checkbox value="banana" />
          Banana
        </label>
      </CheckboxGroup>,
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('controlled mode with value prop', () => {
    render(
      <CheckboxGroup value={['apple']}>
        <Checkbox value="apple" />
        <Checkbox value="banana" />
      </CheckboxGroup>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('data-checked', '');
    expect(checkboxes[1]).not.toHaveAttribute('data-checked');
  });

  it('uncontrolled mode with defaultValue', () => {
    render(
      <CheckboxGroup defaultValue={['banana']}>
        <Checkbox value="apple" />
        <Checkbox value="banana" />
      </CheckboxGroup>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toHaveAttribute('data-checked');
    expect(checkboxes[1]).toHaveAttribute('data-checked', '');
  });

  it('onValueChange fires when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <CheckboxGroup defaultValue={[]} onValueChange={onValueChange}>
        <Checkbox value="apple" />
        <Checkbox value="banana" />
      </CheckboxGroup>,
    );
    await user.click(screen.getAllByRole('checkbox')[0]);
    expect(onValueChange).toHaveBeenCalled();
  });

  it('disabled group sets data-disabled', () => {
    render(
      <CheckboxGroup disabled data-testid="group">
        <Checkbox value="a" />
      </CheckboxGroup>,
    );
    expect(screen.getByTestId('group')).toHaveAttribute('data-disabled', '');
  });

  it('sets displayName', () => {
    expect(CheckboxGroup.displayName).toBe('CheckboxGroup');
  });
});
