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
              ? ` — variants: ${variants.flatMap((v) => Object.entries(v.variants).map(([k, opts]) => `${k}(${opts.join('|')})`)).join(', ')}`
              : '';
          return `- ${c.name}${variantInfo}`;
        })
        .join('\n');

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

1. Import components from '@hareru/ui' and styles from '@hareru/ui/styles.css'
2. Use only semantic variant props (e.g. variant="primary"), never hardcode CSS values
3. Use CSS variables (--hui-*) for any custom styling
4. All components support forwardRef
5. Use BEM class naming (hui-*) if adding custom classes
6. Colors use OKLCH format

## Task

${description}

Generate a complete ${fw} component that fulfills this requirement.`,
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

      const rulesSections = Object.entries(rules.rules)
        .map(([key, section]) => {
          const ruleList = section.rules.map((r) => `- ${r}`).join('\n');
          const examples = Object.entries(section.examples)
            .map(([label, code]) => `  ${label}: ${code}`)
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
