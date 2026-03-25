'use client';

import {
  FormField,
  FormFieldControl,
  FormFieldDescription,
  FormFieldLabel,
  FormFieldMessage,
  Input,
} from '@hareru/ui';

export default function FormFieldDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '24rem' }}>
      <FormField>
        <FormFieldLabel>Username</FormFieldLabel>
        <FormFieldControl>
          <Input placeholder="johndoe" />
        </FormFieldControl>
        <FormFieldDescription>This is your public display name.</FormFieldDescription>
      </FormField>

      <FormField error>
        <FormFieldLabel>Email</FormFieldLabel>
        <FormFieldControl>
          <Input type="email" placeholder="you@example.com" error />
        </FormFieldControl>
        <FormFieldDescription>We will never share your email.</FormFieldDescription>
        <FormFieldMessage>Please enter a valid email address.</FormFieldMessage>
      </FormField>
    </div>
  );
}
