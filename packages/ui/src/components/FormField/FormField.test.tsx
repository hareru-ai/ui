import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '../Checkbox/Checkbox';
import { RadioGroup, RadioGroupItem } from '../RadioGroup/RadioGroup';
import {
  FormField,
  FormFieldControl,
  FormFieldDescription,
  FormFieldGroupLabel,
  FormFieldLabel,
  FormFieldMessage,
} from './FormField';

describe('FormField', () => {
  it('renders all sub-components', () => {
    render(
      <FormField>
        <FormFieldLabel>Email</FormFieldLabel>
        <FormFieldControl>
          <input type="email" />
        </FormFieldControl>
        <FormFieldDescription>Enter your email address</FormFieldDescription>
        <FormFieldMessage>Required</FormFieldMessage>
      </FormField>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('connects label to control via htmlFor/id', () => {
    render(
      <FormField>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldControl>
          <input type="text" />
        </FormFieldControl>
      </FormField>,
    );
    const label = screen.getByText('Name');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('sets aria-invalid when error is true', () => {
    render(
      <FormField error>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldControl>
          <input type="text" />
        </FormFieldControl>
      </FormField>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies error class to label when error', () => {
    render(
      <FormField error>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldControl>
          <input type="text" />
        </FormFieldControl>
      </FormField>,
    );
    expect(screen.getByText('Name')).toHaveClass('hui-form-field__label--error');
  });

  it('renders message with alert role when error', () => {
    render(
      <FormField error>
        <FormFieldLabel>Email</FormFieldLabel>
        <FormFieldControl>
          <input type="email" />
        </FormFieldControl>
        <FormFieldMessage>Invalid email</FormFieldMessage>
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('hides message when children is empty', () => {
    const { container } = render(
      <FormField>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldControl>
          <input type="text" />
        </FormFieldControl>
        <FormFieldMessage>{null}</FormFieldMessage>
      </FormField>,
    );
    expect(container.querySelector('.hui-form-field__message')).not.toBeInTheDocument();
  });

  it('throws when FormFieldControl has multiple children', () => {
    expect(() =>
      render(
        <FormField>
          <FormFieldControl>
            <input type="text" />
            <button type="button">Clear</button>
          </FormFieldControl>
        </FormField>,
      ),
    ).toThrow();
  });

  it('sets aria-describedby with description and message IDs', () => {
    render(
      <FormField>
        <FormFieldControl>
          <input type="text" />
        </FormFieldControl>
        <FormFieldDescription>Help</FormFieldDescription>
        <FormFieldMessage>Error</FormFieldMessage>
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    const describedby = input.getAttribute('aria-describedby');
    expect(describedby).toContain('-description');
    expect(describedby).toContain('-message');
  });

  it('merges custom className', () => {
    render(
      <FormField className="custom-field">
        <FormFieldLabel className="custom-label">Name</FormFieldLabel>
        <FormFieldControl>
          <input type="text" />
        </FormFieldControl>
      </FormField>,
    );
    expect(screen.getByText('Name').closest('.hui-form-field')).toHaveClass('custom-field');
    expect(screen.getByText('Name')).toHaveClass('custom-label');
  });

  // --- group mode tests ---

  it('applies role="group" and aria-labelledby when group prop is set', () => {
    render(
      <FormField group>
        <FormFieldGroupLabel>Preferred fruit</FormFieldGroupLabel>
        <FormFieldControl>
          <div role="radiogroup" />
        </FormFieldControl>
      </FormField>,
    );
    const fieldDiv = screen.getByRole('group');
    expect(fieldDiv).toBeInTheDocument();
    const groupLabel = screen.getByText('Preferred fruit');
    expect(fieldDiv).toHaveAttribute('aria-labelledby', groupLabel.id);
  });

  it('FormFieldGroupLabel renders a span with labelId', () => {
    render(
      <FormField group>
        <FormFieldGroupLabel>Choose one</FormFieldGroupLabel>
        <FormFieldControl>
          <div role="radiogroup" />
        </FormFieldControl>
      </FormField>,
    );
    const label = screen.getByText('Choose one');
    expect(label.tagName).toBe('SPAN');
    expect(label.id).toContain('-label');
  });

  it('FormFieldGroupLabel applies error style', () => {
    render(
      <FormField group error>
        <FormFieldGroupLabel>Choose one</FormFieldGroupLabel>
        <FormFieldControl>
          <div role="radiogroup" />
        </FormFieldControl>
      </FormField>,
    );
    expect(screen.getByText('Choose one')).toHaveClass('hui-form-field__label--error');
  });

  it('FormFieldControl injects aria-labelledby in group mode', () => {
    render(
      <FormField group>
        <FormFieldGroupLabel>Fruit</FormFieldGroupLabel>
        <FormFieldControl>
          <div role="radiogroup" />
        </FormFieldControl>
      </FormField>,
    );
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-labelledby');
    expect(radiogroup).not.toHaveAttribute('id');
  });

  it('FormFieldControl injects id in non-group mode (existing behavior)', () => {
    render(
      <FormField>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldControl>
          <input type="text" />
        </FormFieldControl>
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id');
  });

  it('throws when FormFieldLabel is used in group mode', () => {
    expect(() =>
      render(
        <FormField group>
          <FormFieldLabel>Bad usage</FormFieldLabel>
          <FormFieldControl>
            <div role="radiogroup" />
          </FormFieldControl>
        </FormField>,
      ),
    ).toThrow('FormFieldLabel must not be used within <FormField group>');
  });

  it('throws when FormFieldGroupLabel is used in non-group mode', () => {
    expect(() =>
      render(
        <FormField>
          <FormFieldGroupLabel>Bad usage</FormFieldGroupLabel>
          <FormFieldControl>
            <input type="text" />
          </FormFieldControl>
        </FormField>,
      ),
    ).toThrow('FormFieldGroupLabel must be used within <FormField group>');
  });

  it('group mode error sets aria-invalid on control child', () => {
    render(
      <FormField group error>
        <FormFieldGroupLabel>Fruit</FormFieldGroupLabel>
        <FormFieldControl>
          <div role="radiogroup" />
        </FormFieldControl>
      </FormField>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });

  it('group mode renders message with alert role when error', () => {
    render(
      <FormField group error>
        <FormFieldGroupLabel>Fruit</FormFieldGroupLabel>
        <FormFieldControl>
          <div role="radiogroup" />
        </FormFieldControl>
        <FormFieldMessage>Please select a fruit</FormFieldMessage>
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a fruit');
  });

  // --- Integration tests with real components ---

  it('injects aria-invalid into Checkbox via FormFieldControl', () => {
    render(
      <FormField error>
        <FormFieldLabel>Accept</FormFieldLabel>
        <FormFieldControl>
          <Checkbox />
        </FormFieldControl>
      </FormField>,
    );
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('injects aria-labelledby into RadioGroup via group mode FormFieldControl', () => {
    render(
      <FormField group>
        <FormFieldGroupLabel>Fruit</FormFieldGroupLabel>
        <FormFieldControl>
          <RadioGroup>
            <RadioGroupItem value="apple">Apple</RadioGroupItem>
          </RadioGroup>
        </FormFieldControl>
      </FormField>,
    );
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeInTheDocument();
  });
});
