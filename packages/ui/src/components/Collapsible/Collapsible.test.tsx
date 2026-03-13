import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible';

describe('Collapsible', () => {
  it('renders with closed state by default', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles open state on trigger click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    const content = screen.getByTestId('content');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content).not.toHaveAttribute('data-open');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(content).toHaveAttribute('data-open');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content).not.toHaveAttribute('data-open');
  });

  it('respects controlled open prop', () => {
    const { rerender } = render(
      <Collapsible open={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    const content = screen.getByTestId('content');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content).not.toHaveAttribute('data-open');

    rerender(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>,
    );

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(content).toHaveAttribute('data-open');
  });

  it('calls onOpenChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Collapsible onOpenChange={handleChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Toggle' });

    await user.click(trigger);
    expect(handleChange).toHaveBeenCalledWith(true);

    await user.click(trigger);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible disabled>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Toggle' });

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('forwards ref to the collapsible root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Collapsible ref={ref}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('hui-collapsible');
  });

  it('merges custom className with base class', () => {
    render(
      <Collapsible className="custom-class">
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    const root = screen.getByText('Toggle').closest('.hui-collapsible');
    expect(root).toHaveClass('hui-collapsible');
    expect(root).toHaveClass('custom-class');
  });

  it('has correct BEM class', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    const root = screen.getByText('Toggle').closest('.hui-collapsible');
    expect(root).toHaveClass('hui-collapsible');
  });

  describe('CollapsibleTrigger', () => {
    it('renders as a button with correct role', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      expect(trigger).toBeInTheDocument();
    });

    it('forwards ref to the trigger element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <Collapsible>
          <CollapsibleTrigger ref={ref}>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveClass('hui-collapsible__trigger');
    });

    it('merges custom className with base class', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger className="custom-trigger">Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      expect(trigger).toHaveClass('hui-collapsible__trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('has correct BEM class', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
      );
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      expect(trigger).toHaveClass('hui-collapsible__trigger');
    });
  });

  describe('CollapsibleContent', () => {
    it('renders content when open', () => {
      render(
        <Collapsible open={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent data-testid="content">Content</CollapsibleContent>
        </Collapsible>,
      );
      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-open');
    });

    it('hides content when closed', () => {
      render(
        <Collapsible open={false}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent data-testid="content">Content</CollapsibleContent>
        </Collapsible>,
      );
      const content = screen.getByTestId('content');
      expect(content).not.toHaveAttribute('data-open');
    });

    it('forwards ref to the content element', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent ref={ref} data-testid="content">
            Content
          </CollapsibleContent>
        </Collapsible>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass('hui-collapsible__content');
    });

    it('merges custom className with base class', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent className="custom-content" data-testid="content">
            Content
          </CollapsibleContent>
        </Collapsible>,
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('hui-collapsible__content');
      expect(content).toHaveClass('custom-content');
    });

    it('has correct BEM class', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent data-testid="content">Content</CollapsibleContent>
        </Collapsible>,
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('hui-collapsible__content');
    });
  });
});
