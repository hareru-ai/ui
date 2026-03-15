import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from './EmptyState';

describe('EmptyState', () => {
  it('renders all sub-components', () => {
    render(
      <EmptyState>
        <EmptyStateIcon>
          <span>icon</span>
        </EmptyStateIcon>
        <EmptyStateTitle>No results</EmptyStateTitle>
        <EmptyStateDescription>Try a different query</EmptyStateDescription>
        <EmptyStateAction>
          <button type="button">Retry</button>
        </EmptyStateAction>
      </EmptyState>,
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try a different query')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('has role="status"', () => {
    render(
      <EmptyState>
        <EmptyStateTitle>Empty</EmptyStateTitle>
      </EmptyState>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <EmptyState className="custom">
        <EmptyStateTitle>Empty</EmptyStateTitle>
      </EmptyState>,
    );
    expect(screen.getByRole('status')).toHaveClass('hui-empty-state', 'custom');
  });

  it('hides icon from screen readers', () => {
    const { container } = render(
      <EmptyState>
        <EmptyStateIcon>
          <span>icon</span>
        </EmptyStateIcon>
      </EmptyState>,
    );
    expect(container.querySelector('.hui-empty-state__icon')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('sets displayName on all sub-components', () => {
    expect(EmptyState.displayName).toBe('EmptyState');
    expect(EmptyStateIcon.displayName).toBe('EmptyStateIcon');
    expect(EmptyStateTitle.displayName).toBe('EmptyStateTitle');
    expect(EmptyStateDescription.displayName).toBe('EmptyStateDescription');
    expect(EmptyStateAction.displayName).toBe('EmptyStateAction');
  });
});
