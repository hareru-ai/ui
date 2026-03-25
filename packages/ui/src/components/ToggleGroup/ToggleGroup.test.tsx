import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';

describe('ToggleGroup', () => {
  it('renders with BEM class', () => {
    render(
      <ToggleGroup data-testid="group">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByTestId('group')).toHaveClass('hui-toggle-group');
  });

  it('merges className on ToggleGroup', () => {
    render(
      <ToggleGroup data-testid="group" className="extra">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByTestId('group')).toHaveClass('hui-toggle-group', 'extra');
  });

  it('renders items with BEM class', () => {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('hui-toggle-group__item');
  });

  it('merges className on ToggleGroupItem', () => {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a" className="custom">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass(
      'hui-toggle-group__item',
      'custom',
    );
  });

  it('single mode: pressing one deselects previous', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['a'], expect.anything());

    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['b'], expect.anything());
  });

  it('multiple mode: allows multiple selections', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup multiple onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['a'], expect.anything());

    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b'], expect.anything());
  });

  it('controlled mode with value prop', () => {
    render(
      <ToggleGroup value={['a']}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('data-pressed', '');
    expect(screen.getByRole('button', { name: 'B' })).not.toHaveAttribute('data-pressed');
  });

  it('uncontrolled mode with defaultValue', () => {
    render(
      <ToggleGroup defaultValue={['b']}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('data-pressed', '');
  });

  it('onValueChange callback fires', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup onValueChange={onValueChange}>
        <ToggleGroupItem value="x">X</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'X' }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('group disabled prevents interaction', () => {
    render(
      <ToggleGroup disabled>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
  });

  it('individual item disabled', () => {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a" disabled>
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'B' })).not.toBeDisabled();
  });

  it('orientation vertical sets data attribute', () => {
    render(
      <ToggleGroup orientation="vertical" data-testid="group">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByTestId('group')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('orientation horizontal by default', () => {
    render(
      <ToggleGroup data-testid="group">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByTestId('group')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('size variant sm applies BEM class', () => {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a" size="sm">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('hui-toggle-group__item--sm');
  });

  it('size variant lg applies BEM class', () => {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a" size="lg">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('hui-toggle-group__item--lg');
  });

  it('variant outline applies BEM class', () => {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a" variant="outline">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass(
      'hui-toggle-group__item--outline',
    );
  });

  it('default variant applies BEM class', () => {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass(
      'hui-toggle-group__item--default',
    );
  });

  it('forwards ref on ToggleGroup', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ToggleGroup ref={ref}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref on ToggleGroupItem', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ToggleGroup>
        <ToggleGroupItem ref={ref} value="a">
          A
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('keyboard navigation with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>,
    );
    const btnA = screen.getByRole('button', { name: 'A' });
    btnA.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus();
  });
});
