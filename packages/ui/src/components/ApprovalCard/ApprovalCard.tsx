import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type ApprovalRisk = 'low' | 'medium' | 'high';

export interface ApprovalCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Title */
  title: string;
  /** Description text */
  description?: string;
  /** Status */
  status?: ApprovalStatus;
  /** Approve handler */
  onApprove?: () => void;
  /** Reject handler */
  onReject?: () => void;
  /** Approve button label */
  approveLabel?: string;
  /** Reject button label */
  rejectLabel?: string;
  /** Risk level */
  risk?: ApprovalRisk;
}

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
};

export const ApprovalCard = forwardRef<HTMLDivElement, ApprovalCardProps>(
  (
    {
      title,
      description,
      status = 'pending',
      onApprove,
      onReject,
      approveLabel = 'Approve',
      rejectLabel = 'Reject',
      risk = 'low',
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        'hui-approval-card',
        `hui-approval-card--${status}`,
        `hui-approval-card--risk-${risk}`,
        className,
      )}
      {...props}
      role={status === 'pending' ? 'alert' : 'region'}
    >
      <div className="hui-approval-card__header">
        <h4 className="hui-approval-card__title">{title}</h4>
        <span className={cn('hui-approval-card__status', `hui-approval-card__status--${status}`)}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {description && <p className="hui-approval-card__description">{description}</p>}

      {status === 'pending' && (
        <div className="hui-approval-card__actions">
          {onReject && (
            <button type="button" className="hui-approval-card__reject" onClick={onReject}>
              {rejectLabel}
            </button>
          )}
          {onApprove && (
            <button type="button" className="hui-approval-card__approve" onClick={onApprove}>
              {approveLabel}
            </button>
          )}
        </div>
      )}
    </div>
  ),
);
ApprovalCard.displayName = 'ApprovalCard';
