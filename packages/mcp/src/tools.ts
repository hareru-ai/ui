import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { loadRegistry, loadSchema } from './utils.js';
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
  parts.push('## Import');
  parts.push('');
  parts.push('```tsx');
  const subs = entry.subcomponents ?? [];
  const allNames = [entry.name, ...subs];
  parts.push(`import { ${allNames.join(', ')} } from '@hareru/ui';`);
  parts.push(`import '@hareru/ui/styles.css';`);
  parts.push('```');
  parts.push('');

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
      parts.push(`- **${prop.name}** extends \`${prop.extends}\``);
    }
    parts.push('');
  }

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

  return parts.join('\n');
}

export function registerTools(server: McpServer): void {
  server.tool(
    'get-component-usage',
    'Get usage documentation for a Hareru UI component — import, variants, props, and JSX example',
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
}
