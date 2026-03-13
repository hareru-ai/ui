import { Logo } from '@/app/components/logo';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Link from 'next/link';

export default function HomePage() {
  return (
    <HomeLayout
      nav={{
        title: <Logo />,
      }}
      links={[
        { text: 'Docs', url: '/docs' },
        { text: 'GitHub', url: 'https://github.com/hareru-ai/ui', external: true },
      ]}
    >
      <section className="fd-flex fd-flex-col fd-items-center fd-justify-center fd-text-center fd-py-32 fd-px-8 fd-gap-6">
        <h1 className="fd-text-5xl fd-font-bold fd-tracking-tight">Hareru UI</h1>
        <p className="fd-text-xl fd-text-fd-muted-foreground fd-max-w-2xl">
          Semantic CSS design system for React. Built with OKLCH colors, BEM naming, and CSS custom
          properties.
        </p>
        <div className="fd-flex fd-gap-3 fd-mt-2">
          <Link
            href="/docs"
            className="fd-inline-flex fd-items-center fd-justify-center fd-h-11 fd-px-6 fd-text-base fd-font-medium fd-bg-fd-primary fd-text-fd-primary-foreground fd-rounded-lg fd-no-underline hover:fd-bg-fd-primary/90 fd-transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/docs/components"
            className="fd-inline-flex fd-items-center fd-justify-center fd-h-11 fd-px-6 fd-text-base fd-font-medium fd-border fd-border-fd-border fd-rounded-lg fd-no-underline hover:fd-bg-fd-accent fd-transition-colors"
          >
            Components
          </Link>
        </div>
      </section>

      <section className="fd-grid fd-grid-cols-1 md:fd-grid-cols-3 fd-gap-6 fd-max-w-5xl fd-mx-auto fd-px-8 fd-pb-24">
        <div className="fd-rounded-xl fd-border fd-border-fd-border fd-p-6">
          <h3 className="fd-font-semibold fd-mb-2">OKLCH Colors</h3>
          <p className="fd-text-sm fd-text-fd-muted-foreground">
            Perceptually uniform color system with full gamut mapping and semantic token names.
          </p>
        </div>
        <div className="fd-rounded-xl fd-border fd-border-fd-border fd-p-6">
          <h3 className="fd-font-semibold fd-mb-2">40+ Components</h3>
          <p className="fd-text-sm fd-text-fd-muted-foreground">
            Accessible React components built on Base UI primitives with BEM CSS styling.
          </p>
        </div>
        <div className="fd-rounded-xl fd-border fd-border-fd-border fd-p-6">
          <h3 className="fd-font-semibold fd-mb-2">AI-Ready</h3>
          <p className="fd-text-sm fd-text-fd-muted-foreground">
            MCP server for AI agent integration. Design tokens exposed via JSON Schema.
          </p>
        </div>
      </section>
    </HomeLayout>
  );
}
