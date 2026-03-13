import { Logo } from '@/app/components/logo';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} nav={{ title: <Logo /> }}>
      {children}
    </DocsLayout>
  );
}
