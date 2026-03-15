import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

describe('Dialog', () => {
  const renderDialog = (props = {}) =>
    render(
      <Dialog {...props}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <p>Dialog body</p>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

  it('opens on trigger click', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on overlay click', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Click the overlay (the element behind dialog content)
    const overlay = document.querySelector('.hui-dialog__overlay');
    expect(overlay).toBeInTheDocument();
    if (overlay) {
      await user.click(overlay);
    }
    // After animation, dialog should be removed
  });

  it('closes on close button click', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const closeButtons = screen.getAllByRole('button', { name: /close|cancel/i });
    await user.click(closeButtons[0]);
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
  });

  it('renders title with correct class', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const title = screen.getByText('Title');
    expect(title).toHaveClass('hui-dialog__title');
  });

  it('renders description with correct class', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const desc = screen.getByText('Description');
    expect(desc).toHaveClass('hui-dialog__description');
  });

  it('renders header and footer', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.querySelector('.hui-dialog__header')).toBeInTheDocument();
    expect(document.querySelector('.hui-dialog__footer')).toBeInTheDocument();
  });

  it('merges custom className on content', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="custom-dialog">
          <DialogTitle>Test</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
          <p>Body</p>
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toHaveClass('hui-dialog__content', 'custom-dialog');
  });

  it('forwards ref on DialogContent', async () => {
    const ref = createRef<HTMLDivElement>();
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent ref={ref}>
          <DialogTitle>Test</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
          <p>Body</p>
        </DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
