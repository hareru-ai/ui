import { Tabs as BaseTabs } from '@base-ui-components/react/tabs';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

// --- Tabs (root) ---
export const Tabs = BaseTabs.Root;

// --- TabsList ---
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <BaseTabs.List ref={ref} className={cn('hui-tabs__list', className)} {...props} />
  ),
);
TabsList.displayName = 'TabsList';

// --- TabsTrigger ---
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <BaseTabs.Tab ref={ref} className={cn('hui-tabs__trigger', className)} {...props} />
  ),
);
TabsTrigger.displayName = 'TabsTrigger';

// --- TabsContent ---
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <BaseTabs.Panel ref={ref} className={cn('hui-tabs__content', className)} {...props} />
  ),
);
TabsContent.displayName = 'TabsContent';
