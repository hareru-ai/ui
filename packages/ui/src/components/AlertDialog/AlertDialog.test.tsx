import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';

describe('AlertDialog', () => {
  const renderAlertDialog = (props = {}) =>
    render(
      <AlertDialog {...props}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogDescription>Description</AlertDialogDescription>
          </AlertDialogHeader>
          <p>Alert dialog body</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

  it('opens on trigger click', async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('closes on action click', async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
  });

  it('closes on cancel click', async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('renders title with correct class', async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const title = screen.getByText('Title');
    expect(title).toHaveClass('hui-alert-dialog__title');
  });

  it('renders description with correct class', async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const desc = screen.getByText('Description');
    expect(desc).toHaveClass('hui-alert-dialog__description');
  });

  it('renders header and footer', async () => {
    const user = userEvent.setup();
    renderAlertDialog();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.querySelector('.hui-alert-dialog__header')).toBeInTheDocument();
    expect(document.querySelector('.hui-alert-dialog__footer')).toBeInTheDocument();
  });

  it('merges custom className on content', async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="custom-alert-dialog">
          <AlertDialogTitle>Test</AlertDialogTitle>
          <AlertDialogDescription>Desc</AlertDialogDescription>
          <p>Body</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('alertdialog')).toHaveClass(
      'hui-alert-dialog__content',
      'custom-alert-dialog',
    );
  });

  it('forwards ref on AlertDialogContent', async () => {
    const ref = createRef<HTMLDivElement>();
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent ref={ref}>
          <AlertDialogTitle>Test</AlertDialogTitle>
          <AlertDialogDescription>Desc</AlertDialogDescription>
          <p>Body</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
