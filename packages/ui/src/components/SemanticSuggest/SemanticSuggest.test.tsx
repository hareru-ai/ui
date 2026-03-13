import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SemanticSuggest } from './SemanticSuggest';

describe('SemanticSuggest', () => {
  it('renders with required props', () => {
    render(<SemanticSuggest type="add_synonym" title="Add synonym for revenue" />);
    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getByText('Add synonym for revenue')).toBeInTheDocument();
  });

  it('applies type modifier class for add_synonym', () => {
    render(<SemanticSuggest type="add_synonym" title="Test" />);
    expect(screen.getByRole('region')).toHaveClass('hui-semantic-suggest--add_synonym');
  });

  it('applies type modifier class for add_gotcha', () => {
    render(<SemanticSuggest type="add_gotcha" title="Test" />);
    expect(screen.getByRole('region')).toHaveClass('hui-semantic-suggest--add_gotcha');
  });

  it('applies type modifier class for split_metric', () => {
    render(<SemanticSuggest type="split_metric" title="Test" />);
    expect(screen.getByRole('region')).toHaveClass('hui-semantic-suggest--split_metric');
  });

  it('applies type modifier class for update_instruction', () => {
    render(<SemanticSuggest type="update_instruction" title="Test" />);
    expect(screen.getByRole('region')).toHaveClass('hui-semantic-suggest--update_instruction');
  });

  it('applies status modifier class for pending', () => {
    render(<SemanticSuggest type="add_synonym" title="Test" status="pending" />);
    expect(screen.getByRole('region')).toHaveClass('hui-semantic-suggest--pending');
  });

  it('applies status modifier class for accepted', () => {
    render(<SemanticSuggest type="add_synonym" title="Test" status="accepted" />);
    expect(screen.getByRole('region')).toHaveClass('hui-semantic-suggest--accepted');
  });

  it('applies status modifier class for rejected', () => {
    render(<SemanticSuggest type="add_synonym" title="Test" status="rejected" />);
    expect(screen.getByRole('region')).toHaveClass('hui-semantic-suggest--rejected');
  });

  it('shows description when provided', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        description="Some detailed description"
      />,
    );
    expect(screen.getByText('Some detailed description')).toBeInTheDocument();
  });

  it('hides description when not provided', () => {
    const { container } = render(
      <SemanticSuggest type="add_synonym" title="Test" />,
    );
    expect(container.querySelector('.hui-semantic-suggest__description')).not.toBeInTheDocument();
  });

  it('shows evidence with queryCount', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        evidence={{ queryCount: 42 }}
      />,
    );
    expect(screen.getByText(/42 queries/)).toBeInTheDocument();
  });

  it('shows evidence with successRate as percentage', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        evidence={{ successRate: 0.85 }}
      />,
    );
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('shows evidence with pattern text', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        evidence={{ pattern: 'Users frequently search for sales' }}
      />,
    );
    expect(screen.getByText(/Users frequently search for sales/)).toBeInTheDocument();
  });

  it('shows preview in pre element', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        preview={'synonyms:\n  - revenue\n  - sales'}
      />,
    );
    const pre = screen.getByText(/synonyms:/);
    expect(pre.tagName).toBe('PRE');
    expect(pre).toHaveClass('hui-semantic-suggest__preview');
  });

  it('shows action buttons when status is pending', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        status="pending"
        onAccept={() => {}}
        onReject={() => {}}
      />,
    );
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('hides action buttons when status is accepted', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        status="accepted"
        onAccept={() => {}}
        onReject={() => {}}
      />,
    );
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
  });

  it('hides action buttons when status is rejected', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        status="rejected"
        onAccept={() => {}}
        onReject={() => {}}
      />,
    );
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
  });

  it('calls onAccept when accept button clicked', async () => {
    const user = userEvent.setup();
    const handleAccept = vi.fn();
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        status="pending"
        onAccept={handleAccept}
      />,
    );
    await user.click(screen.getByText('Accept'));
    expect(handleAccept).toHaveBeenCalledOnce();
  });

  it('calls onReject when reject button clicked', async () => {
    const user = userEvent.setup();
    const handleReject = vi.fn();
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        status="pending"
        onReject={handleReject}
      />,
    );
    await user.click(screen.getByText('Dismiss'));
    expect(handleReject).toHaveBeenCalledOnce();
  });

  it('shows custom accept/reject labels', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        status="pending"
        acceptLabel="Apply"
        rejectLabel="Skip"
      />,
    );
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('shows confidence percentage in header', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        confidence={0.92}
      />,
    );
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toHaveClass('hui-semantic-suggest__confidence');
  });

  it('shows status label for accepted', () => {
    render(
      <SemanticSuggest type="add_synonym" title="Test" status="accepted" />,
    );
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('shows status label for rejected', () => {
    render(
      <SemanticSuggest type="add_synonym" title="Test" status="rejected" />,
    );
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('sets data-type attribute', () => {
    render(<SemanticSuggest type="add_gotcha" title="Test" />);
    expect(screen.getByRole('region')).toHaveAttribute('data-type', 'add_gotcha');
  });

  it('sets data-status attribute', () => {
    render(<SemanticSuggest type="add_synonym" title="Test" status="accepted" />);
    expect(screen.getByRole('region')).toHaveAttribute('data-status', 'accepted');
  });

  it('forwards className', () => {
    render(
      <SemanticSuggest
        type="add_synonym"
        title="Test"
        className="custom-class"
      />,
    );
    const region = screen.getByRole('region');
    expect(region).toHaveClass('hui-semantic-suggest', 'custom-class');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<SemanticSuggest ref={ref} type="add_synonym" title="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('hui-semantic-suggest');
  });

  it('sets role="region" and aria-label', () => {
    render(<SemanticSuggest type="add_synonym" title="My suggestion" />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'My suggestion');
  });
});
