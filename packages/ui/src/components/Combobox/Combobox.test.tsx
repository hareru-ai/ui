import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from './Combobox';

describe('Combobox', () => {
  const renderCombobox = () =>
    render(
      <Combobox>
        <ComboboxTrigger>Select fruit...</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search..." />
          <ComboboxList>
            <ComboboxEmpty>No results</ComboboxEmpty>
            <ComboboxGroup heading="Fruits">
              <ComboboxItem value="apple">Apple</ComboboxItem>
              <ComboboxItem value="banana">Banana</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );

  it('renders trigger with correct class', () => {
    renderCombobox();
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('hui-combobox__trigger');
  });

  it('trigger has role="combobox"', () => {
    renderCombobox();
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  it('trigger click opens content', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const trigger = screen.getByRole('combobox');

    await user.click(trigger);

    const content = document.querySelector('.hui-combobox__content');
    expect(content).toBeInTheDocument();
  });

  it('merges custom className on trigger', () => {
    render(
      <Combobox>
        <ComboboxTrigger className="custom-class">Select...</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="test">Test</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('hui-combobox__trigger');
    expect(trigger).toHaveClass('custom-class');
  });

  it('content renders with correct class when open', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const trigger = screen.getByRole('combobox');

    await user.click(trigger);

    const content = document.querySelector('.hui-combobox__content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('hui-combobox__content');
  });

  it('input renders with search icon', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const trigger = screen.getByRole('combobox');

    await user.click(trigger);

    const searchIcon = document.querySelector('.hui-combobox__search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('input renders with correct class', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const trigger = screen.getByRole('combobox');

    await user.click(trigger);

    const input = document.querySelector('.hui-combobox__input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('hui-combobox__input');
  });

  it('list renders with correct class', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const trigger = screen.getByRole('combobox');

    await user.click(trigger);

    const list = document.querySelector('.hui-combobox__list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass('hui-combobox__list');
  });

  it('item renders with correct class', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const trigger = screen.getByRole('combobox');

    await user.click(trigger);

    const item = document.querySelector('.hui-combobox__item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveClass('hui-combobox__item');
  });

  it('empty state shows when no items match', async () => {
    const user = userEvent.setup();
    render(
      <Combobox>
        <ComboboxTrigger>Select...</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search..." />
          <ComboboxList>
            <ComboboxEmpty>No results found</ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    const trigger = screen.getByRole('combobox');

    await user.click(trigger);

    const empty = screen.getByText('No results found');
    expect(empty).toBeInTheDocument();
  });

  it('group renders with correct class', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const trigger = screen.getByRole('combobox');

    await user.click(trigger);

    const group = document.querySelector('.hui-combobox__group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveClass('hui-combobox__group');
  });

  it('controlled mode works', () => {
    render(
      <Combobox open onOpenChange={vi.fn()}>
        <ComboboxTrigger>Select...</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search..." />
          <ComboboxList>
            <ComboboxEmpty>No results</ComboboxEmpty>
            <ComboboxItem value="apple">Apple</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );

    const content = document.querySelector('.hui-combobox__content');
    expect(content).toBeInTheDocument();
  });

  it('forwards ref on ComboboxTrigger', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Combobox>
        <ComboboxTrigger ref={ref}>Select...</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="test">Test</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('ComboboxItem calls onSelect callback', async () => {
    const user = userEvent.setup();
    const onSelectSpy = vi.fn();
    render(
      <Combobox>
        <ComboboxTrigger>Select...</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="apple" onSelect={onSelectSpy}>
              Apple
            </ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    const item = screen.getByText('Apple');
    await user.click(item);

    expect(onSelectSpy).toHaveBeenCalled();
  });
});
