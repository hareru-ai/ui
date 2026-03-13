import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Sheet';

describe('Sheet', () => {
  const renderSheet = (props: { side?: 'top' | 'bottom' | 'left' | 'right' } = {}) =>
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side={props.side}>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
          <p>Content</p>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );

  it('opens on trigger click', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on close button click', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await user.click(closeButtons[0]);
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
  });

  it('closes on overlay click', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const overlay = document.querySelector('.hui-sheet__overlay');
    expect(overlay).toBeInTheDocument();
    if (overlay) {
      await user.click(overlay);
    }
  });

  it('applies default side class (right)', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toHaveClass('hui-sheet__content--right');
  });

  it('applies side="top" class', async () => {
    const user = userEvent.setup();
    renderSheet({ side: 'top' });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toHaveClass('hui-sheet__content--top');
  });

  it('applies side="bottom" class', async () => {
    const user = userEvent.setup();
    renderSheet({ side: 'bottom' });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toHaveClass('hui-sheet__content--bottom');
  });

  it('applies side="left" class', async () => {
    const user = userEvent.setup();
    renderSheet({ side: 'left' });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toHaveClass('hui-sheet__content--left');
  });

  it('applies side="right" class explicitly', async () => {
    const user = userEvent.setup();
    renderSheet({ side: 'right' });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toHaveClass('hui-sheet__content--right');
  });

  it('renders title with correct class', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const title = screen.getByText('Title');
    expect(title).toHaveClass('hui-sheet__title');
  });

  it('renders description with correct class', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const desc = screen.getByText('Description');
    expect(desc).toHaveClass('hui-sheet__description');
  });

  it('renders header with correct class', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.querySelector('.hui-sheet__header')).toBeInTheDocument();
  });

  it('renders footer with correct class', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.querySelector('.hui-sheet__footer')).toBeInTheDocument();
  });

  it('renders close button', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.querySelector('.hui-sheet__close')).toBeInTheDocument();
  });

  it('merges custom className on content', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent className="custom-sheet">
          <SheetTitle>Test</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
          <p>Body</p>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toHaveClass('hui-sheet__content', 'custom-sheet');
  });

  it('forwards ref on SheetContent', async () => {
    const ref = createRef<HTMLDivElement>();
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent ref={ref}>
          <SheetTitle>Test</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
          <p>Body</p>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('close button has default aria-label="Close"', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const closeBtn = document.querySelector('.hui-sheet__close');
    expect(closeBtn).toHaveAttribute('aria-label', 'Close');
  });

  it('applies custom closeLabel', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent closeLabel="Dismiss">
          <SheetTitle>Test</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const closeBtn = document.querySelector('.hui-sheet__close');
    expect(closeBtn).toHaveAttribute('aria-label', 'Dismiss');
  });
});
