'use client';

import {
  Button,
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateTitle,
} from '@hareru/ui';

export default function EmptyStateDemo() {
  return (
    <EmptyState>
      <EmptyStateTitle>No results found</EmptyStateTitle>
      <EmptyStateDescription>
        Try adjusting your search or filter to find what you are looking for.
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button variant="outline">Clear filters</Button>
      </EmptyStateAction>
    </EmptyState>
  );
}
