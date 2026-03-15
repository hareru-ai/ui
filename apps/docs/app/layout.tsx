import { RootProvider } from 'fumadocs-ui/provider/next';
import 'fumadocs-ui/style.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: {
    default: 'Hareru UI',
    template: '%s | Hareru UI',
  },
  description: 'Semantic CSS design system for React',
  icons: {
    icon: [
      { url: '/favicon--light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/favicon--dark.svg', media: '(prefers-color-scheme: dark)' },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
