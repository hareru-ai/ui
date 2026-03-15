import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

describe('Tabs', () => {
  const renderTabs = (props = {}) =>
    render(
      <Tabs defaultValue="tab1" {...props}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3" disabled>
            Tab 3
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>,
    );

  it('renders with default value', () => {
    renderTabs();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('renders all triggers', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
  });

  it('switches tab on click', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('sets aria-selected on selected trigger', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Tab 1', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2', selected: false })).toBeInTheDocument();
  });

  it('renders disabled trigger', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute('data-disabled');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderTabs();
    await act(async () => {
      screen.getByRole('tab', { name: 'Tab 1' }).focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();
  });

  it('merges custom className on TabsList', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list" data-testid="list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId('list')).toHaveClass('hui-tabs__list', 'custom-list');
  });

  it('forwards ref on TabsTrigger', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" ref={ref}>
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
