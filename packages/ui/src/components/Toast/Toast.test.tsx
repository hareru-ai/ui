import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastVariants,
} from './Toast';
import { Toaster } from './Toaster';
import { toast } from './use-toast';

describe('Toast', () => {
  it('Toast primitive renders with correct class', () => {
    const { container } = render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Test toast</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    const toastElement = container.querySelector('.hui-toast');
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveClass('hui-toast');
  });

  it('applies default variant class', () => {
    const { container } = render(
      <ToastProvider>
        <Toast open variant="default">
          <ToastTitle>Default toast</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    const toastElement = container.querySelector('.hui-toast');
    expect(toastElement).toHaveClass('hui-toast--default');
  });

  it('applies destructive variant class', () => {
    const { container } = render(
      <ToastProvider>
        <Toast open variant="destructive">
          <ToastTitle>Destructive toast</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    const toastElement = container.querySelector('.hui-toast');
    expect(toastElement).toHaveClass('hui-toast--destructive');
  });

  it('renders title and description', () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Test Title</ToastTitle>
          <ToastDescription>Test Description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders ToastAction with altText', () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Title</ToastTitle>
          <ToastAction altText="Undo action">Undo</ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    const actionButton = screen.getByRole('button', { name: /undo/i });
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveClass('hui-toast__action');
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ToastProvider>
        <Toast ref={ref} open>
          <ToastTitle>Ref test</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges custom className', () => {
    const { container } = render(
      <ToastProvider>
        <Toast open className="custom-class">
          <ToastTitle>Custom class test</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    const toastElement = container.querySelector('.hui-toast');
    expect(toastElement).toHaveClass('hui-toast', 'custom-class');
  });

  it('ToastViewport renders with correct class', () => {
    const { container } = render(
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>,
    );

    const viewport = container.querySelector('.hui-toast__viewport');
    expect(viewport).toBeInTheDocument();
  });

  it('toast() function shows toast imperatively', async () => {
    render(<Toaster />);

    act(() => {
      toast({
        title: 'Imperative Toast',
        description: 'This was called outside React',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Imperative Toast')).toBeInTheDocument();
    });

    expect(screen.getByText('This was called outside React')).toBeInTheDocument();
  });

  it('dismiss works', async () => {
    render(<Toaster />);

    let dismissFn: (() => void) | undefined;

    act(() => {
      const result = toast({
        title: 'Dismissable Toast',
      });
      dismissFn = result.dismiss;
    });

    await waitFor(() => {
      expect(screen.getByText('Dismissable Toast')).toBeInTheDocument();
    });

    // dismiss should not throw and should set open: false internally
    act(() => {
      dismissFn?.();
    });
  });

  it('toastVariants generates correct classes', () => {
    expect(toastVariants({ variant: 'default' })).toContain('hui-toast--default');
    expect(toastVariants({ variant: 'destructive' })).toContain('hui-toast--destructive');
  });

  it('close button is rendered', async () => {
    render(<Toaster />);

    act(() => {
      toast({
        title: 'Closeable Toast',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Closeable Toast')).toBeInTheDocument();
    });

    const closeButton = document.querySelector('.hui-toast__close');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveClass('hui-toast__close');
  });

  it('close button SVG has aria-hidden', async () => {
    render(<Toaster />);
    act(() => {
      toast({ title: 'Test' });
    });
    await waitFor(() => {
      screen.getByText('Test');
    });
    const svg = document.querySelector('.hui-toast__close svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
