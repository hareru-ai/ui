import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  FormField,
  FormFieldControl,
  FormFieldDescription,
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
});
