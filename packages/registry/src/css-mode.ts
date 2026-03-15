import type { CssMode, CssModeContext } from './types.js';

export const CSS_MODES: readonly CssMode[] = [
  'standalone',
  'portable',
  'tailwind',
  'per-component',
] as const;

export const CSS_MODE_DESCRIPTIONS: Readonly<Record<CssMode, string>> = {
  standalone:
    'All-in-one bundle. Single import includes tokens, reset, and all component styles. Simplest setup.',
  portable:
    'Tokens + component bundle imported separately. No reset included — works alongside existing CSS frameworks.',
  tailwind:
    'Tailwind v4 coexistence via Cascade Layers. Components in @layer hui; Tailwind utilities remain highest priority.',
  'per-component':
    'Import only the CSS for components you use. Best for minimal bundle size in production.',
};

/**
 * Recommend a CSS mode based on project context.
 *
 * Heuristics (evaluated in order):
 * 1. Tailwind detected → 'tailwind'
 * 2. Few components (≤3) → 'per-component'
 * 3. Existing CSS reset/framework detected → 'portable'
 * 4. Default → 'standalone'
 */
export function recommendCssMode(context: CssModeContext): {
  mode: CssMode;
  reason: string;
} {
  if (context.hasTailwind) {
    return {
      mode: 'tailwind',
      reason:
        'Tailwind CSS detected. Uses Cascade Layers (@layer hui) to avoid specificity conflicts with Tailwind utilities.',
    };
  }

  if (context.componentCount > 0 && context.componentCount <= 3) {
    return {
      mode: 'per-component',
      reason: `Only ${context.componentCount} component(s) used. Per-component imports minimize CSS bundle size.`,
    };
  }

  if (context.hasExistingReset) {
    return {
      mode: 'portable',
      reason:
        'Existing CSS reset/framework detected. Portable mode imports tokens and components separately without adding a redundant reset.',
    };
  }

  return {
    mode: 'standalone',
    reason:
      'Standalone mode provides the simplest setup with a single CSS import that includes all tokens and components.',
  };
}
