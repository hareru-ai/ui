import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { loadConsumerRules, loadRegistry, loadSchema } from './utils.js';

export function registerPrompts(server: McpServer): void {
  server.prompt(
    'create-ui',
    'Generate a UI component using Hareru UI design system',
    {
      description: z
        .string()
        .describe(
          'What the component should do (e.g. "A settings form with name and email fields")',
        ),
      framework: z.string().optional().describe('Target framework: react (default)'),
    },
    async ({ description, framework }) => {
      const registry = loadRegistry();
      const schema = loadSchema();

      const componentList = registry.components
        .map((c) => {
          const variants = c.variants ?? [];
          const variantInfo =
            variants.length > 0
              ? ` [${variants.flatMap((v) => Object.entries(v.variants).map(([k, opts]) => `${k}(${opts.join('|')})`)).join(', ')}]`
              : '';
          const desc = c.description ? ` — ${c.description}` : '';
          return `- ${c.name}${variantInfo}${desc}`;
        })
        .join('\n');

      const bundles = registry.taskBundles ?? [];
      const bundleList =
        bundles.length > 0
          ? bundles
              .map((b) => `- ${b.name}: ${b.description} (${b.components.length} components)`)
              .join('\n')
          : '';

      const cssVars = schema.properties.cssVariables.items.enum.slice(0, 20).join(', ');
      const fw = framework ?? 'react';

      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `You are a UI developer using the Hareru UI design system (${fw}).

## Available Components

${componentList}

## Design Token CSS Variables (sample)

${cssVars}, ...

## Rules

1. Import components from '@hareru/ui'. For CSS setup, refer to the consumer-rules (standalone: '@hareru/ui/styles.css', portable: '@hareru/tokens/css' + '@hareru/ui/styles/components.css')
2. Use only semantic variant props (e.g. variant="default"), never hardcode CSS values
3. Use CSS variables (--hui-*) for any custom styling
4. All components support forwardRef
5. Use BEM class naming (hui-*) if adding custom classes
6. Colors use OKLCH format

## Task

${description}
${bundleList ? `\n## Available Bundles\n\n${bundleList}\n` : ''}
Generate a complete ${fw} component that fulfills this requirement.`,
            },
          },
        ],
      };
    },
  );

  server.prompt(
    'create-ui-tailwind',
    'Generate a UI component mixing Hareru UI and Tailwind CSS with Cascade Layer guidance',
    {
      description: z
        .string()
        .describe(
          'What the component should do (e.g. "A dashboard card with Tailwind layout and Hareru UI buttons")',
        ),
    },
    async ({ description }) => {
      const registry = loadRegistry();

      const componentList = registry.components
        .map((c) => {
          const desc = c.description ? ` — ${c.description}` : '';
          return `- ${c.name}${desc}`;
        })
        .join('\n');

      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `You are a UI developer using Hareru UI + Tailwind CSS v4 together.

## Cascade Layer Order

Declare this layer order at the top of your CSS entry point:

\`\`\`css
@layer theme, base, hui, components, utilities;
@import 'tailwindcss';
@import '@hareru/tokens/css';
@import '@hareru/ui/styles/components.layer.css';
\`\`\`

- Hareru components live in \`@layer hui\` — below Tailwind \`utilities\`
- Tailwind utility classes (e.g. \`flex\`, \`gap-4\`, \`p-2\`) can safely override Hareru layout
- Never use Tailwind classes to override Hareru component internals (colors, border-radius, shadows) — use \`--hui-*\` CSS variables instead

## Mixing Classes Example

\`\`\`tsx
{/* Tailwind for layout, Hareru for components */}
<div className="flex gap-4 p-6">
  <Card className="flex-1">
    <CardHeader>Title</CardHeader>
    <CardContent>
      <Button variant="default">Action</Button>
    </CardContent>
  </Card>
</div>
\`\`\`

## Available Components

${componentList}

## Rules

1. Import components from \`@hareru/ui\`
2. Use Tailwind utilities for layout (flex, grid, gap, padding, margin)
3. Use Hareru components for interactive UI elements (Button, Input, Card, Dialog)
4. Use \`--hui-*\` CSS variables for theming — do not override with Tailwind color classes
5. Use BEM class naming (\`hui-*\`) if adding custom component styles
6. Colors are OKLCH format

## Task

${description}

Generate a complete React component that combines Tailwind layout utilities with Hareru UI components.`,
            },
          },
        ],
      };
    },
  );

  server.prompt(
    'consumer-rules',
    'Get the rules for using Hareru UI in your project',
    {},
    async () => {
      const rules = loadConsumerRules();

      const CODE_BLOCK_SECTIONS = new Set(['cssImports']);

      const rulesSections = Object.entries(rules.rules)
        .map(([key, section]) => {
          const ruleList = section.rules.map((r) => `- ${r}`).join('\n');
          const examples = Object.entries(section.examples)
            .map(([label, code]) =>
              CODE_BLOCK_SECTIONS.has(key)
                ? `**${label}:**\n\`\`\`css\n${code}\n\`\`\``
                : `  ${label}: ${code}`,
            )
            .join('\n');
          return `### ${key}\n${section.description}\n\n${ruleList}\n\nExamples:\n${examples}`;
        })
        .join('\n\n');

      const tokenRef = Object.entries(rules.tokenQuickReference)
        .map(([category, pattern]) => `- ${category}: ${pattern}`)
        .join('\n');

      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `# Hareru UI Consumer Rules (v${rules.version})

These rules apply when using Hareru UI in any project.

## Rules

${rulesSections}

## Token Quick Reference

${tokenRef}`,
            },
          },
        ],
      };
    },
  );
}
