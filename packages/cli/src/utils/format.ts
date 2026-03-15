import type { ComponentEntry, ComponentGroup, CssMode, TaskBundle } from '@hareru/registry';
import { CSS_MODES } from '@hareru/registry';

export type { CssMode };
export { CSS_MODES };

const GROUP_ORDER: readonly ComponentGroup[] = [
  'core',
  'form',
  'layout',
  'overlay',
  'navigation',
  'feedback',
  'data-display',
  'agent',
  'di-domain',
] as const;

export function formatComponentList(components: ComponentEntry[], group?: string): string {
  const filtered = group ? components.filter((c) => c.group === group) : components;

  if (filtered.length === 0) {
    return group ? `No components in group "${group}".` : 'No components found.';
  }

  const grouped = new Map<string, ComponentEntry[]>();
  for (const comp of filtered) {
    const g = comp.group;
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)?.push(comp);
  }

  const lines: string[] = [];
  for (const g of GROUP_ORDER) {
    const comps = grouped.get(g);
    if (!comps) continue;
    lines.push(`${g}:`);
    for (const c of comps) {
      lines.push(`  ${c.name}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

export function formatBundleList(bundles: TaskBundle[]): string {
  if (bundles.length === 0) return 'No task bundles found.';

  const lines: string[] = [];
  for (const b of bundles) {
    lines.push(`${b.name}`);
    lines.push(`  ${b.description}`);
    lines.push(`  Components: ${b.components.join(', ')}`);
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

export function formatComponentDetail(entry: ComponentEntry): string {
  const lines: string[] = [];

  lines.push(entry.displayName);
  lines.push('');
  lines.push(entry.description);
  lines.push('');

  lines.push(`Group: ${entry.group}`);
  lines.push(`CSS:   @hareru/ui/${entry.cssArtifact}`);
  if (entry.requiredCssArtifacts.length > 0) {
    lines.push(`Deps:  ${entry.requiredCssArtifacts.map((a) => `@hareru/ui/${a}`).join(', ')}`);
  }
  lines.push(`Tokens: ${entry.tokenCategories.join(', ')}`);
  lines.push('');

  // Import
  const subs = entry.subcomponents ?? [];
  const allNames = [entry.name, ...subs];
  lines.push(`import { ${allNames.join(', ')} } from '@hareru/ui';`);
  lines.push('');

  // CSS per-component
  lines.push('CSS (per-component):');
  lines.push(`  @import '@hareru/tokens/css';`);
  for (const dep of entry.requiredCssArtifacts) {
    lines.push(`  @import '@hareru/ui/${dep}';`);
  }
  lines.push(`  @import '@hareru/ui/${entry.cssArtifact}';`);
  lines.push('');

  // Variants
  const variants = entry.variants ?? [];
  if (variants.length > 0) {
    lines.push('Variants:');
    for (const v of variants) {
      for (const [key, options] of Object.entries(v.variants)) {
        const def = v.defaultVariants[key] ?? '-';
        lines.push(`  ${key}: ${options.join(', ')} (default: ${def})`);
      }
    }
    lines.push('');
  }

  // States (Phase 3C)
  const states = entry.states ?? [];
  if (states.length > 0) {
    lines.push('States:');
    for (const s of states) {
      if (s.type === 'enum') {
        const values = s.values.join(' | ');
        const def = s.defaultValue ? ` (default: ${s.defaultValue})` : '';
        lines.push(`  ${s.name}: ${values}${def}`);
      } else {
        lines.push(`  ${s.name}: boolean`);
      }
    }
    lines.push('');
  }

  // Accessibility (Phase 3C)
  const a11y = entry.a11y;
  if (a11y) {
    lines.push('Accessibility:');
    if (a11y.roles?.length) lines.push(`  Roles: ${a11y.roles.join(', ')}`);
    if (a11y.ariaAttributes?.length) lines.push(`  ARIA: ${a11y.ariaAttributes.join(', ')}`);
    if (a11y.semanticElements?.length)
      lines.push(`  Semantic: ${a11y.semanticElements.join(', ')}`);
    if (a11y.keyboardInteractions?.length)
      lines.push(`  Keyboard: ${a11y.keyboardInteractions.join('; ')}`);
    if (a11y.liveRegion) lines.push('  Live region: yes');
    if (a11y.notes) lines.push(`  Notes: ${a11y.notes}`);
    lines.push('');
  }

  // Peer components
  if (entry.peerComponents) {
    lines.push(`Also consider: ${entry.peerComponents.join(', ')}`);
    lines.push('');
  }

  // Example (Phase 3C)
  const examples = entry.examples ?? [];
  if (examples.length > 0) {
    lines.push('Example:');
    for (const ex of examples) {
      lines.push(`  [${ex.title}]`);
      lines.push(`  ${ex.code.split('\n').join('\n  ')}`);
      lines.push('');
    }
  }

  return lines.join('\n').trimEnd();
}

export function formatBundleDetail(
  bundle: TaskBundle,
  componentMap: Map<string, ComponentEntry>,
): string {
  const lines: string[] = [];

  lines.push(`Bundle: ${bundle.name}`);
  lines.push('');
  lines.push(bundle.description);
  lines.push('');

  // Import (deduplicated)
  const seen = new Set<string>();
  const allImports: string[] = [];
  for (const compName of bundle.components) {
    if (!seen.has(compName)) {
      seen.add(compName);
      allImports.push(compName);
    }
    const comp = componentMap.get(compName);
    if (comp?.subcomponents) {
      for (const sub of comp.subcomponents) {
        if (!seen.has(sub)) {
          seen.add(sub);
          allImports.push(sub);
        }
      }
    }
  }
  lines.push(`import { ${allImports.join(', ')} } from '@hareru/ui';`);
  lines.push('');

  // CSS per-component
  lines.push('CSS (per-component):');
  lines.push(`  @import '@hareru/tokens/css';`);
  for (const artifact of bundle.cssArtifacts) {
    lines.push(`  @import '@hareru/ui/${artifact}';`);
  }
  lines.push('');

  lines.push(`Tokens: ${bundle.tokenCategories.join(', ')}`);
  lines.push('');

  lines.push('Components:');
  for (const compName of bundle.components) {
    const comp = componentMap.get(compName);
    if (comp) {
      lines.push(`  ${comp.name} — ${comp.description}`);
    } else {
      lines.push(`  ${compName}`);
    }
  }

  return lines.join('\n').trimEnd();
}

// CssMode and CSS_MODES are re-exported from @hareru/registry at the top of this file

export interface CssImportOptions {
  mode: CssMode;
  layer?: boolean;
  scope?: boolean;
  baseline?: boolean;
}

export function generateCssImports(
  options: CssImportOptions,
  entry?: ComponentEntry,
  bundle?: TaskBundle,
): { imports: string[]; warnings: string[] } {
  const { mode, layer, scope, baseline } = options;
  const imports: string[] = [];
  const warnings: string[] = [];

  switch (mode) {
    case 'standalone': {
      if (scope) warnings.push('--scope is not needed with standalone mode (already included).');
      if (baseline)
        warnings.push('--baseline is not needed with standalone mode (already included).');
      if (layer) {
        imports.push("@import '@hareru/ui/styles.layer.css';");
      } else {
        imports.push("@import '@hareru/ui/styles.css';");
      }
      break;
    }
    case 'portable': {
      imports.push("@import '@hareru/tokens/css';");
      if (baseline) imports.push("@import '@hareru/ui/styles/baseline.css';");
      if (layer) {
        imports.push("@import '@hareru/ui/styles/components.layer.css';");
      } else {
        imports.push("@import '@hareru/ui/styles/components.css';");
      }
      if (scope) imports.push("@import '@hareru/ui/styles/scope.css';");
      break;
    }
    case 'tailwind': {
      if (layer)
        warnings.push(
          '--layer is implicit with tailwind mode (components.layer.css is always used).',
        );
      imports.push('@layer theme, base, hui, components, utilities;');
      imports.push("@import 'tailwindcss';");
      imports.push("@import '@hareru/tokens/css';");
      if (baseline) imports.push("@import '@hareru/ui/styles/baseline.css';");
      imports.push("@import '@hareru/ui/styles/components.layer.css';");
      if (scope) imports.push("@import '@hareru/ui/styles/scope.css';");
      break;
    }
    case 'per-component': {
      if (layer)
        warnings.push(
          '--layer has no effect with per-component mode (no layer variant for individual components).',
        );
      imports.push("@import '@hareru/tokens/css';");
      if (baseline) imports.push("@import '@hareru/ui/styles/baseline.css';");
      if (scope) imports.push("@import '@hareru/ui/styles/scope.css';");

      if (bundle) {
        for (const artifact of bundle.cssArtifacts) {
          imports.push(`@import '@hareru/ui/${artifact}';`);
        }
      } else if (entry) {
        for (const dep of entry.requiredCssArtifacts) {
          imports.push(`@import '@hareru/ui/${dep}';`);
        }
        imports.push(`@import '@hareru/ui/${entry.cssArtifact}';`);
      }
      break;
    }
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown CSS mode: ${_exhaustive}`);
    }
  }

  return { imports, warnings };
}

export function formatAddGuide(
  name: string,
  options: CssImportOptions,
  cssImports: string[],
  jsImports: string[],
  warnings: string[],
  installCmd: string | null,
): string {
  const lines: string[] = [];

  if (installCmd) {
    lines.push('Install:');
    lines.push(`  ${installCmd}`);
    lines.push('');
  }

  if (warnings.length > 0) {
    for (const w of warnings) {
      lines.push(`Warning: ${w}`);
    }
    lines.push('');
  }

  lines.push(`CSS (${options.mode}):`);
  for (const imp of cssImports) {
    lines.push(`  ${imp}`);
  }
  lines.push('');

  lines.push('Import:');
  for (const imp of jsImports) {
    lines.push(`  ${imp}`);
  }

  return lines.join('\n').trimEnd();
}
