import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from './Accordion';

const renderAccordion = (props: React.ComponentProps<typeof Accordion> = {}) =>
  render(
    <Accordion {...props}>
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger>Item 1</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent data-testid="content-1">Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionHeader>
          <AccordionTrigger>Item 2</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent data-testid="content-2">Content 2</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );

describe('Accordion', () => {
  it('renders with correct BEM classes on all subcomponents', () => {
    render(
      <Accordion data-testid="root">
        <AccordionItem value="item-1" data-testid="item">
          <AccordionHeader data-testid="header">
            <AccordionTrigger>Toggle</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent data-testid="content">Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId('root')).toHaveClass('hui-accordion');
    expect(screen.getByTestId('item')).toHaveClass('hui-accordion__item');
    expect(screen.getByTestId('header')).toHaveClass('hui-accordion__header');
    expect(screen.getByRole('button', { name: 'Toggle' })).toHaveClass('hui-accordion__trigger');
    expect(screen.getByTestId('content')).toHaveClass('hui-accordion__content');
  });

  it('opens and closes on trigger click (uncontrolled, multiple mode default)', async () => {
    const user = userEvent.setup();
    renderAccordion();
    const trigger1 = screen.getByRole('button', { name: 'Item 1' });

    expect(trigger1).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger1);
    expect(trigger1).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger1);
    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
  });

  it('type="single" only allows one item open at a time', async () => {
    const user = userEvent.setup();
    renderAccordion({ type: 'single' });
    const trigger1 = screen.getByRole('button', { name: 'Item 1' });
    const trigger2 = screen.getByRole('button', { name: 'Item 2' });

    await user.click(trigger1);
    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    expect(trigger2).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger2);
    expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
  });

  it('multiple mode (default) allows multiple items open simultaneously', async () => {
    const user = userEvent.setup();
    renderAccordion();
    const trigger1 = screen.getByRole('button', { name: 'Item 1' });
    const trigger2 = screen.getByRole('button', { name: 'Item 2' });

    await user.click(trigger1);
    await user.click(trigger2);

    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  it('controlled value + onValueChange callback', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Accordion value={['item-1']} onValueChange={handleChange}>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Item 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Item 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole('button', { name: 'Item 1' });
    expect(trigger1).toHaveAttribute('aria-expanded', 'true');

    const trigger2 = screen.getByRole('button', { name: 'Item 2' });
    await user.click(trigger2);
    expect(handleChange).toHaveBeenCalled();
  });

  it('defaultValue opens items initially', () => {
    renderAccordion({ defaultValue: ['item-1'] });
    expect(screen.getByRole('button', { name: 'Item 1' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Item 2' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('disabled item does not open when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <AccordionItem value="item-1" disabled>
          <AccordionHeader>
            <AccordionTrigger>Item 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: 'Item 1' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('disabled root disables all items', async () => {
    const user = userEvent.setup();
    renderAccordion({ disabled: true });
    const trigger1 = screen.getByRole('button', { name: 'Item 1' });
    const trigger2 = screen.getByRole('button', { name: 'Item 2' });

    await user.click(trigger1);
    await user.click(trigger2);

    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    expect(trigger2).toHaveAttribute('aria-expanded', 'false');
  });

  it('AccordionItem.onOpenChange fires when item is toggled', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    render(
      <Accordion>
        <AccordionItem value="item-1" onOpenChange={handleOpenChange}>
          <AccordionHeader>
            <AccordionTrigger>Item 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: 'Item 1' });

    await user.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    await user.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('forwards ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Accordion ref={ref}>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Item 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('hui-accordion');
  });

  it('forwards ref to the trigger element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger ref={ref}>Item 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveClass('hui-accordion__trigger');
  });

  it('merges custom className with BEM classes on all subcomponents', () => {
    render(
      <Accordion className="custom-root" data-testid="root">
        <AccordionItem value="item-1" className="custom-item" data-testid="item">
          <AccordionHeader className="custom-header" data-testid="header">
            <AccordionTrigger className="custom-trigger">Toggle</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent className="custom-content" data-testid="content">
            Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId('root')).toHaveClass('hui-accordion', 'custom-root');
    expect(screen.getByTestId('item')).toHaveClass('hui-accordion__item', 'custom-item');
    expect(screen.getByTestId('header')).toHaveClass('hui-accordion__header', 'custom-header');
    expect(screen.getByRole('button', { name: 'Toggle' })).toHaveClass(
      'hui-accordion__trigger',
      'custom-trigger',
    );
    expect(screen.getByTestId('content')).toHaveClass('hui-accordion__content', 'custom-content');
  });

  it('AccordionContent uses keepMounted — content stays in DOM when closed', () => {
    renderAccordion();
    expect(screen.getByTestId('content-1')).toBeInTheDocument();
    expect(screen.getByTestId('content-2')).toBeInTheDocument();
    expect(screen.getByTestId('content-1')).not.toHaveAttribute('data-open');
  });

  it('AccordionHeader renders as a heading element', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Item 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
