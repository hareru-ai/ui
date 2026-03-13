import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

describe('Popover', () => {
  it('renders trigger', () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Open</button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('opens on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Open</button>
        </PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('applies custom className to content', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Open</button>
        </PopoverTrigger>
        <PopoverContent className="custom">Body</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Body').closest('.hui-popover__content')).toHaveClass('custom');
  });

  it('sets displayName on PopoverContent', () => {
    expect(PopoverContent.displayName).toBe('PopoverContent');
  });
});
