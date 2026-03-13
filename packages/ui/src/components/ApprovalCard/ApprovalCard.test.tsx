import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalCard } from './ApprovalCard';

describe('ApprovalCard', () => {
  it('renders title and status', () => {
    render(<ApprovalCard title="Delete file?" />);
    expect(screen.getByText('Delete file?')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('has role="alert" when pending', () => {
    render(<ApprovalCard title="Action" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has role="region" when not pending', () => {
    render(<ApprovalCard title="Action" status="approved" />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<ApprovalCard title="Test" description="Are you sure?" />);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('shows approve/reject buttons when pending', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(<ApprovalCard title="Test" onApprove={onApprove} onReject={onReject} />);

    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onApprove).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(onReject).toHaveBeenCalledOnce();
  });

  it('hides buttons when not pending', () => {
    render(
      <ApprovalCard title="Test" status="approved" onApprove={() => {}} onReject={() => {}} />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('applies risk modifier', () => {
    const { container } = render(<ApprovalCard title="Test" risk="high" />);
    expect(container.firstChild).toHaveClass('hui-approval-card--risk-high');
  });

  it('applies status modifier', () => {
    const { container } = render(<ApprovalCard title="Test" status="rejected" />);
    expect(container.firstChild).toHaveClass('hui-approval-card--rejected');
  });

  it('uses custom button labels', () => {
    render(
      <ApprovalCard
        title="Test"
        onApprove={() => {}}
        onReject={() => {}}
        approveLabel="Yes"
        rejectLabel="No"
      />,
    );

    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(<ApprovalCard title="Test" className="custom" />);
    expect(container.firstChild).toHaveClass('hui-approval-card', 'custom');
  });
});
