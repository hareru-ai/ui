import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { ToolCallCard } from './ToolCallCard';

describe('ToolCallCard', () => {
  it('renders tool name and status', () => {
    render(<ToolCallCard toolName="search_web" status="done" />);
    expect(screen.getByText('search_web')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('applies status modifier class', () => {
    const { container } = render(<ToolCallCard toolName="test" status="executing" />);
    expect(container.firstChild).toHaveClass('hui-tool-call-card--executing');
  });

  it('sets data attributes', () => {
    const { container } = render(<ToolCallCard toolName="my_tool" status="pending" />);
    expect(container.firstChild).toHaveAttribute('data-tool-name', 'my_tool');
    expect(container.firstChild).toHaveAttribute('data-status', 'pending');
  });

  it('shows args when expanded', () => {
    render(
      <ToolCallCard toolName="test" status="done" args={{ query: 'hello' }} defaultExpanded />,
    );
    expect(screen.getByText(/hello/)).toBeInTheDocument();
  });

  it('hides body when collapsed', () => {
    render(<ToolCallCard toolName="test" status="done" args={{ query: 'hello' }} />);
    expect(screen.queryByText(/hello/)).not.toBeInTheDocument();
  });

  it('toggles body on click', async () => {
    const user = userEvent.setup();
    render(<ToolCallCard toolName="test" status="done" args={{ query: 'hello' }} />);

    const toggle = screen.getByRole('button', { name: 'Expand' });
    await user.click(toggle);
    expect(screen.getByText(/hello/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(screen.queryByText(/hello/)).not.toBeInTheDocument();
  });

  it('renders result node', () => {
    render(
      <ToolCallCard
        toolName="test"
        status="done"
        result={<span>Result here</span>}
        defaultExpanded
      />,
    );
    expect(screen.getByText('Result here')).toBeInTheDocument();
  });

  it('renders error with role="alert"', () => {
    render(
      <ToolCallCard toolName="test" status="error" error="Something went wrong" defaultExpanded />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('shows duration for done status', () => {
    render(<ToolCallCard toolName="test" status="done" duration={150} />);
    expect(screen.getByText('150ms')).toBeInTheDocument();
  });

  it('always shows body when collapsible is false', () => {
    render(
      <ToolCallCard toolName="test" status="done" args={{ key: 'value' }} collapsible={false} />,
    );
    expect(screen.getByText(/value/)).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<ToolCallCard toolName="test" status="done" className="custom" />);
    expect(container.firstChild).toHaveClass('hui-tool-call-card', 'custom');
  });

  it('renders string args directly (partial JSON streaming)', () => {
    render(
      <ToolCallCard toolName="test" status="executing" args='{"query": "SEL' defaultExpanded />,
    );
    expect(screen.getByText('{"query": "SEL')).toBeInTheDocument();
  });

  it('renders object args as JSON.stringify', () => {
    render(
      <ToolCallCard toolName="test" status="done" args={{ query: 'SELECT *' }} defaultExpanded />,
    );
    expect(screen.getByText(/"query": "SELECT \*"/)).toBeInTheDocument();
  });

  it('shows cursor when argsStreaming is true', () => {
    const { container } = render(
      <ToolCallCard toolName="test" status="executing" args='{"q' argsStreaming defaultExpanded />,
    );
    expect(container.querySelector('.hui-tool-call-card__args-cursor')).toBeInTheDocument();
    expect(container.querySelector('.hui-tool-call-card__args--streaming')).toBeInTheDocument();
  });

  it('hides cursor when argsStreaming is false', () => {
    const { container } = render(
      <ToolCallCard
        toolName="test"
        status="done"
        args={{ query: 'hello' }}
        argsStreaming={false}
        defaultExpanded
      />,
    );
    expect(container.querySelector('.hui-tool-call-card__args-cursor')).not.toBeInTheDocument();
    expect(container.querySelector('.hui-tool-call-card__args--streaming')).not.toBeInTheDocument();
  });

  it('forwards ref to root div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ToolCallCard ref={ref} toolName="test" status="done" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('hui-tool-call-card');
  });
});
