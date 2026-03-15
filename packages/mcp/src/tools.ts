import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  CSS_MODES,
  CSS_MODE_DESCRIPTIONS,
  buildSlotTree,
  loadRegistry,
  loadSchema,
  recommendCssMode,
} from './utils.js';
import type { ComponentEntry } from './utils.js';

function escPipe(s: string): string {
  return s.replace(/\|/g, '\\|');
}

function formatVariantsTable(entry: ComponentEntry): string {
  const variants = entry.variants ?? [];
  if (variants.length === 0) return 'No CVA variants defined.';

  const lines: string[] = ['| Variant | Options | Default |', '|---------|---------|---------|'];
  for (const v of variants) {
    for (const [key, options] of Object.entries(v.variants)) {
      const defaultVal = v.defaultVariants[key] ?? '-';
      lines.push(
        `| ${escPipe(key)} | ${options.map(escPipe).join(', ')} | ${escPipe(defaultVal)} |`,
      );
    }
  }
  return lines.join('\n');
}

function formatUsageMarkdown(entry: ComponentEntry): string {
  const parts: string[] = [];

  parts.push(`# ${entry.displayName}`);
  parts.push('');

  // Description (Phase 3A)
  parts.push(entry.description);
  parts.push('');

  // AI Guidance (Phase 3A)
  if (entry.aiHint) {
    parts.push('## AI Guidance');
    parts.push('');
    parts.push(entry.aiHint);
    parts.push('');
  }

  // Import section
  parts.push('## Import');
  parts.push('');
  parts.push('```tsx');
  const subs = entry.subcomponents ?? [];
  const allNames = [entry.name, ...subs];
  parts.push(`import { ${allNames.join(', ')} } from '@hareru/ui';`);
  parts.push('```');
  parts.push('');

  // CSS section (registry-driven)
  parts.push('## CSS');
  parts.push('');
  parts.push('**Standalone:**');
  parts.push('```css');
  parts.push(`@import '@hareru/ui/styles.css';`);
  parts.push('```');
  parts.push('');
  parts.push('**Per-component:**');
  parts.push('```css');
  parts.push(`@import '@hareru/tokens/css';`);
  for (const dep of entry.requiredCssArtifacts ?? []) {
    parts.push(`@import '@hareru/ui/${dep}';`);
  }
  parts.push(`@import '@hareru/ui/${entry.cssArtifact}';`);
  parts.push('```');
  parts.push('');

  // Structure (Phase 3D) — placed after CSS, before Variants in markdown doc format
  const slotTree = buildSlotTree(
    entry.name,
    entry.slots,
    entry.name === 'Table' ? ['TableRow is also valid inside TableHeader.'] : undefined,
  );
  if (slotTree) {
    parts.push('## Structure');
    parts.push('');
    parts.push('```text');
    parts.push(slotTree);
    parts.push('```');
    parts.push('');
  }

  const variants = entry.variants ?? [];
  const props = entry.props ?? [];

  if (variants.length > 0) {
    parts.push('## Variants');
    parts.push('');
    parts.push(formatVariantsTable(entry));
    parts.push('');
  }

  if (props.length > 0) {
    parts.push('## Props');
    parts.push('');
    for (const prop of props) {
      if (prop.extends) {
        parts.push(`- **${prop.name}** extends \`${prop.extends}\``);
      } else {
        parts.push(`- **${prop.name}**`);
      }
    }
    parts.push('');
  }

  // States (Phase 3C)
  const states = entry.states ?? [];
  if (states.length > 0) {
    parts.push('## States');
    parts.push('');
    parts.push('| State | Type | Values | Default |');
    parts.push('|-------|------|--------|---------|');
    for (const s of states) {
      const values = s.type === 'enum' ? s.values.map(escPipe).join(', ') : '-';
      const def = s.type === 'enum' && s.defaultValue ? escPipe(s.defaultValue) : '-';
      parts.push(`| ${escPipe(s.name)} | ${s.type} | ${values} | ${def} |`);
    }
    parts.push('');
  }

  // Accessibility (Phase 3C)
  const a11y = entry.a11y;
  if (a11y) {
    parts.push('## Accessibility');
    parts.push('');
    if (a11y.roles?.length) parts.push(`- Roles: ${a11y.roles.join(', ')}`);
    if (a11y.ariaAttributes?.length) parts.push(`- ARIA: ${a11y.ariaAttributes.join(', ')}`);
    if (a11y.semanticElements?.length)
      parts.push(`- Semantic elements: ${a11y.semanticElements.join(', ')}`);
    if (a11y.keyboardInteractions?.length)
      parts.push(`- Keyboard: ${a11y.keyboardInteractions.join('; ')}`);
    if (a11y.liveRegion) parts.push('- Live region: yes');
    if (a11y.notes) parts.push(`- Notes: ${a11y.notes}`);
    parts.push('');
  }

  // Also Consider (Phase 3A)
  if (entry.peerComponents) {
    parts.push('## Also Consider');
    parts.push('');
    for (const peer of entry.peerComponents) {
      parts.push(`- ${peer}`);
    }
    parts.push('');
  }

  // Example (Phase 3C: prefer canonical examples from manifest)
  const examples = entry.examples ?? [];
  if (examples.length > 0) {
    parts.push('## Example');
    parts.push('');
    for (const ex of examples) {
      parts.push(`### ${ex.title}`);
      parts.push('');
      parts.push('```tsx');
      parts.push(ex.code);
      parts.push('```');
      parts.push('');
    }
  } else {
    // Fallback: auto-generated example
    parts.push('## Example');
    parts.push('');
    parts.push('```tsx');
    if (variants.length > 0) {
      const firstVariant = variants[0];
      const propsStr = Object.entries(firstVariant.defaultVariants)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
      parts.push(`<${entry.name} ${propsStr}>Content</${entry.name}>`);
    } else if (subs.length > 0) {
      parts.push(`<${entry.name}>`);
      for (const sub of subs) {
        parts.push(`  <${sub}>Content</${sub}>`);
      }
      parts.push(`</${entry.name}>`);
    } else {
      parts.push(`<${entry.name}>Content</${entry.name}>`);
    }
    parts.push('```');
  }

  return parts.join('\n');
}

export function registerTools(server: McpServer): void {
  server.tool(
    'get-component-usage',
    'Get usage documentation for a Hareru UI component — import, structure, variants, props, states, accessibility, slots, and examples',
    { componentName: z.string().describe('Component name (e.g. "Button", "Card", "Alert")') },
    async ({ componentName }) => {
      const registry = loadRegistry();
      const entry = registry.components.find(
        (c) => c.name.toLowerCase() === componentName.toLowerCase(),
      );

      if (!entry) {
        const available = registry.components.map((c) => c.name).join(', ');
        return {
          content: [
            {
              type: 'text' as const,
              text: `Component "${componentName}" not found. Available components: ${available}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text' as const, text: formatUsageMarkdown(entry) }],
      };
    },
  );

  server.tool(
    'get-bundle-usage',
    'Get usage documentation for a Hareru UI task bundle — components, CSS imports, and token categories',
    { bundleName: z.string().describe('Bundle name (e.g. "agent-chat-shell", "form-basics")') },
    async ({ bundleName }) => {
      const registry = loadRegistry();
      const bundles = registry.taskBundles ?? [];
      const bundle = bundles.find((b) => b.name.toLowerCase() === bundleName.toLowerCase());

      if (!bundle) {
        const available = bundles.map((b) => b.name).join(', ');
        return {
          content: [
            {
              type: 'text' as const,
              text: `Bundle "${bundleName}" not found. Available bundles: ${available}`,
            },
          ],
          isError: true,
        };
      }

      const componentMap = new Map(registry.components.map((c) => [c.name, c]));

      const parts: string[] = [];
      parts.push(`# Bundle: ${bundle.name}`);
      parts.push('');
      parts.push(bundle.description);
      parts.push('');

      // Import section — expand subcomponents so the import is copy-pasteable
      const allImports: string[] = [];
      for (const compName of bundle.components) {
        const comp = componentMap.get(compName);
        allImports.push(compName);
        if (comp?.subcomponents) {
          allImports.push(...comp.subcomponents);
        }
      }
      parts.push('## Import');
      parts.push('');
      parts.push('```tsx');
      parts.push(`import { ${allImports.join(', ')} } from '@hareru/ui';`);
      parts.push('```');
      parts.push('');

      // CSS section
      parts.push('## CSS');
      parts.push('');
      parts.push('**Standalone:**');
      parts.push('```css');
      parts.push(`@import '@hareru/ui/styles.css';`);
      parts.push('```');
      parts.push('');
      parts.push('**Per-component:**');
      parts.push('```css');
      parts.push(`@import '@hareru/tokens/css';`);
      for (const artifact of bundle.cssArtifacts) {
        parts.push(`@import '@hareru/ui/${artifact}';`);
      }
      parts.push('```');
      parts.push('');

      // Token categories
      parts.push('## Token Categories');
      parts.push('');
      parts.push(bundle.tokenCategories.join(', '));
      parts.push('');

      // Components detail
      parts.push('## Components');
      parts.push('');
      for (const compName of bundle.components) {
        const comp = componentMap.get(compName);
        if (comp) {
          parts.push(`- **${comp.name}** — ${comp.description}`);
        } else {
          parts.push(`- **${compName}**`);
        }
      }
      parts.push('');

      return {
        content: [{ type: 'text' as const, text: parts.join('\n') }],
      };
    },
  );

  server.tool(
    'validate-token-value',
    'Validate a CSS token value against the Hareru UI design token schema',
    {
      tokenType: z
        .string()
        .describe(
          'Token type: color, dimension, fontFamily, fontWeight, duration, number, shadow, typography, cubicBezier',
        ),
      value: z.string().describe('The value to validate (e.g. "oklch(0.5 0.2 250)")'),
    },
    async ({ tokenType, value }) => {
      const schema = loadSchema();
      const constraint =
        schema.properties.typeConstraints.properties[
          tokenType as keyof typeof schema.properties.typeConstraints.properties
        ];

      if (!constraint) {
        const availableTypes = Object.keys(schema.properties.typeConstraints.properties).join(', ');
        return {
          content: [
            {
              type: 'text' as const,
              text: `Unknown token type "${tokenType}". Available types: ${availableTypes}`,
            },
          ],
          isError: true,
        };
      }

      if (!constraint.pattern) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Valid — token type "${tokenType}" has no pattern constraint (any ${constraint.type ?? 'string'} value accepted).`,
            },
          ],
        };
      }

      let regex: RegExp;
      try {
        regex = new RegExp(constraint.pattern);
      } catch {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error — invalid pattern for token type "${tokenType}": ${constraint.pattern}`,
            },
          ],
          isError: true,
        };
      }

      const isValid = regex.test(value);

      if (isValid) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Valid — "${value}" matches the ${tokenType} pattern: ${constraint.pattern}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `Invalid — "${value}" does not match the ${tokenType} pattern.\nExpected: ${constraint.pattern}\nDescription: ${constraint.description ?? tokenType}`,
          },
        ],
      };
    },
  );

  server.tool(
    'recommend-css-mode',
    'Recommend the best CSS import mode for a Hareru UI project based on project context',
    {
      hasTailwind: z.boolean().describe('Whether Tailwind CSS is detected in the project'),
      componentCount: z
        .number()
        .int()
        .min(0)
        .describe('Number of Hareru components used in the project'),
      hasExistingReset: z
        .boolean()
        .optional()
        .describe(
          'Whether the project already has a CSS reset or framework (e.g. Bootstrap, Pico CSS)',
        ),
    },
    async ({ hasTailwind, componentCount, hasExistingReset }) => {
      const result = recommendCssMode({ hasTailwind, componentCount, hasExistingReset });

      const allModes = CSS_MODES.map((m) => {
        const marker = m === result.mode ? ' ← recommended' : '';
        return `- **${m}**: ${CSS_MODE_DESCRIPTIONS[m]}${marker}`;
      }).join('\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `## Recommended CSS Mode: \`${result.mode}\`\n\n${result.reason}\n\n## All Modes\n\n${allModes}`,
          },
        ],
      };
    },
  );

  server.tool(
    'list-components-by-group',
    'List Hareru UI components filtered by group',
    {
      group: z
        .enum([
          'core',
          'form',
          'layout',
          'overlay',
          'navigation',
          'feedback',
          'data-display',
          'agent',
          'di-domain',
        ])
        .describe('Component group to filter by'),
    },
    async ({ group }) => {
      const registry = loadRegistry();
      const filtered = registry.components.filter((c) => c.group === group);

      if (filtered.length === 0) {
        const groups = [...new Set(registry.components.map((c) => c.group))].sort();
        return {
          content: [
            {
              type: 'text' as const,
              text: `No components in group "${group}". Available groups: ${groups.join(', ')}`,
            },
          ],
          isError: true,
        };
      }

      const lines = filtered
        .map((c) => {
          const variants = c.variants ?? [];
          const variantInfo =
            variants.length > 0
              ? ` [${variants.flatMap((v) => Object.entries(v.variants).map(([k, opts]) => `${k}(${opts.join('|')})`)).join(', ')}]`
              : '';
          return `- **${c.name}**${variantInfo} — ${c.description}`;
        })
        .join('\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `## ${group} (${filtered.length} components)\n\n${lines}`,
          },
        ],
      };
    },
  );
}
