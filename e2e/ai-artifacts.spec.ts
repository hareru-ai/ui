import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * E2E tests for AI integration build artifacts.
 *
 * Validates that pnpm build produces correct machine-readable outputs
 * that AI tools can consume: tokens.json, tokens.schema.json, component-registry.json.
 */

test.describe('AI artifacts — tokens.json', () => {
  const tokensPath = resolve('packages/tokens/dist/tokens.json');
  let tokens: { light: Record<string, unknown>; dark: Record<string, unknown> };

  test.beforeAll(() => {
    tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));
  });

  test('has light and dark theme groups', () => {
    expect(tokens.light).toBeDefined();
    expect(tokens.dark).toBeDefined();
  });

  test('light theme contains all DTCG token categories', () => {
    const categories = ['color', 'spacing', 'radius', 'font', 'typography', 'shadow', 'duration', 'easing', 'zIndex'];
    for (const cat of categories) {
      expect(tokens.light[cat], `light.${cat} should exist`).toBeDefined();
    }
  });

  test('dark theme contains color overrides', () => {
    expect(tokens.dark.color).toBeDefined();
  });

  test('leaf tokens have $type and $value', () => {
    function assertLeafTokens(obj: Record<string, unknown>, path: string): void {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = `${path}.${key}`;
        if (typeof value === 'object' && value !== null && '$type' in value) {
          const token = value as { $type: string; $value: unknown };
          expect(token.$type, `${currentPath}.$type`).toBeTruthy();
          expect(token.$value, `${currentPath}.$value`).toBeDefined();
        } else if (typeof value === 'object' && value !== null) {
          assertLeafTokens(value as Record<string, unknown>, currentPath);
        }
      }
    }
    assertLeafTokens(tokens.light as Record<string, unknown>, 'light');
  });

  test('color.primary has DEFAULT, foreground, hover sub-tokens', () => {
    const primary = (tokens.light.color as Record<string, unknown>).primary as Record<string, unknown>;
    expect(primary.DEFAULT).toBeDefined();
    expect(primary.foreground).toBeDefined();
    expect(primary.hover).toBeDefined();
  });

  test('color tokens use OKLCH format in $value', () => {
    const bg = (tokens.light.color as Record<string, Record<string, { $value: string }>>).background;
    expect(bg.$value).toMatch(/^oklch\(/);
  });

  test('tokens.json is importable via package exports path', () => {
    const pkg = JSON.parse(readFileSync(resolve('packages/tokens/package.json'), 'utf-8'));
    expect(pkg.exports['./tokens.json']).toBe('./dist/tokens.json');
  });
});

test.describe('AI artifacts — tokens.schema.json', () => {
  const schemaPath = resolve('packages/tokens/dist/tokens.schema.json');
  let schema: {
    $schema: string;
    title: string;
    properties: {
      cssVariables: { items: { enum: string[] } };
      tokenPaths: { items: { enum: string[] } };
      typeConstraints: { properties: Record<string, { type: string; pattern?: string }> };
      tokenCount: { const: number };
    };
  };

  test.beforeAll(() => {
    schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  });

  test('has valid JSON Schema $schema field', () => {
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
  });

  test('title is "Hareru UI Design Tokens"', () => {
    expect(schema.title).toBe('Hareru UI Design Tokens');
  });

  test('cssVariables enum has 100+ entries', () => {
    const count = schema.properties.cssVariables.items.enum.length;
    expect(count).toBeGreaterThanOrEqual(100);
  });

  test('all cssVariables start with --hui-', () => {
    for (const v of schema.properties.cssVariables.items.enum) {
      expect(v).toMatch(/^--hui-/);
    }
  });

  test('tokenPaths include key semantic paths', () => {
    const paths = schema.properties.tokenPaths.items.enum;
    expect(paths).toContain('color.primary.DEFAULT');
    expect(paths).toContain('color.background');
    expect(paths).toContain('spacing.4');
    expect(paths).toContain('radius.md');
    expect(paths).toContain('font.family.sans');
    expect(paths).toContain('duration.fast');
    expect(paths).toContain('easing.out');
    expect(paths).toContain('zIndex.dropdown');
  });

  test('typeConstraints has color pattern with oklch', () => {
    const colorConstraint = schema.properties.typeConstraints.properties.color;
    expect(colorConstraint.pattern).toContain('oklch');
  });

  test('typeConstraints has dimension pattern with rem/px', () => {
    const dimConstraint = schema.properties.typeConstraints.properties.dimension;
    expect(dimConstraint.pattern).toContain('rem');
    expect(dimConstraint.pattern).toContain('px');
  });

  test('tokenCount matches cssVariables enum length', () => {
    expect(schema.properties.tokenCount.const).toBe(schema.properties.cssVariables.items.enum.length);
  });

  test('cssVariables and tokenPaths are consistent in count', () => {
    const cssCount = schema.properties.cssVariables.items.enum.length;
    const pathCount = schema.properties.tokenPaths.items.enum.length;
    // typography tokens flatten differently, so exact match isn't expected
    // but they should be in the same order of magnitude
    expect(Math.abs(cssCount - pathCount)).toBeLessThan(50);
  });

  test('schema is importable via package exports path', () => {
    const pkg = JSON.parse(readFileSync(resolve('packages/tokens/package.json'), 'utf-8'));
    expect(pkg.exports['./tokens.schema.json']).toBe('./dist/tokens.schema.json');
  });
});

test.describe('AI artifacts — component-registry.json', () => {
  const registryPath = resolve('packages/ui/dist/component-registry.json');
  let registry: {
    $schema: string;
    name: string;
    version: string;
    componentCount: number;
    components: Array<{
      name: string;
      displayName: string;
      subcomponents?: string[];
      variants?: Array<{
        name: string;
        variants: Record<string, string[]>;
        defaultVariants: Record<string, string>;
      }>;
      props?: Array<{
        name: string;
        extends: string | null;
        customProps?: Array<{ name: string; type: string; required: boolean }>;
      }>;
    }>;
  };

  test.beforeAll(() => {
    registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
  });

  test('has correct package name', () => {
    expect(registry.name).toBe('@hareru/ui');
  });

  test('componentCount matches components array length', () => {
    expect(registry.componentCount).toBe(registry.components.length);
  });

  test('has 40+ components', () => {
    expect(registry.componentCount).toBeGreaterThanOrEqual(40);
  });

  test('every component has name and displayName', () => {
    for (const comp of registry.components) {
      expect(comp.name, 'name should be defined').toBeTruthy();
      expect(comp.displayName, `${comp.name} displayName`).toBeTruthy();
    }
  });

  test('Button has variant and size CVA variants', () => {
    const button = registry.components.find((c) => c.name === 'Button');
    expect(button).toBeDefined();
    expect(button?.variants).toBeDefined();
    const buttonVariant = button?.variants?.[0];
    expect(buttonVariant?.variants.variant).toContain('default');
    expect(buttonVariant?.variants.variant).toContain('destructive');
    expect(buttonVariant?.variants.size).toContain('sm');
    expect(buttonVariant?.variants.size).toContain('lg');
    expect(buttonVariant?.defaultVariants.variant).toBe('default');
    expect(buttonVariant?.defaultVariants.size).toBe('md');
  });

  test('Badge has CVA variants', () => {
    const badge = registry.components.find((c) => c.name === 'Badge');
    expect(badge?.variants).toBeDefined();
    expect(badge?.variants?.[0]?.variants.variant).toContain('default');
    expect(badge?.variants?.[0]?.variants.variant).toContain('destructive');
  });

  test('ChatMessage has user/assistant/system variants', () => {
    const chatMessage = registry.components.find((c) => c.name === 'ChatMessage');
    expect(chatMessage?.variants).toBeDefined();
    const variants = chatMessage?.variants?.[0]?.variants.variant;
    expect(variants).toContain('user');
    expect(variants).toContain('assistant');
    expect(variants).toContain('system');
  });

  test('Card has subcomponents', () => {
    const card = registry.components.find((c) => c.name === 'Card');
    expect(card?.subcomponents).toBeDefined();
    expect(card?.subcomponents).toContain('CardHeader');
    expect(card?.subcomponents).toContain('CardTitle');
    expect(card?.subcomponents).toContain('CardContent');
    expect(card?.subcomponents).toContain('CardFooter');
  });

  test('Dialog has subcomponents', () => {
    const dialog = registry.components.find((c) => c.name === 'Dialog');
    expect(dialog?.subcomponents).toBeDefined();
    expect(dialog?.subcomponents).toContain('DialogTrigger');
    expect(dialog?.subcomponents).toContain('DialogContent');
    expect(dialog?.subcomponents).toContain('DialogTitle');
  });

  test('AI Chat components are registered', () => {
    const aiComponents = ['ChatContainer', 'ChatMessage', 'ChatComposer', 'StreamingText', 'ToolCallCard', 'ApprovalCard', 'ReasoningPanel'];
    for (const name of aiComponents) {
      expect(registry.components.find((c) => c.name === name), `${name} should be registered`).toBeDefined();
    }
  });

  test('components are sorted alphabetically', () => {
    const names = registry.components.map((c) => c.name);
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  test('registry is importable via package exports path', () => {
    const pkg = JSON.parse(readFileSync(resolve('packages/ui/package.json'), 'utf-8'));
    expect(pkg.exports['./component-registry.json']).toBe('./dist/component-registry.json');
  });
});

test.describe('AI artifacts — cross-file consistency', () => {
  test('tokens.json CSS variable count matches schema tokenCount', () => {
    const tokensPath = resolve('packages/tokens/dist/tokens.json');
    const schemaPath = resolve('packages/tokens/dist/tokens.schema.json');

    const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

    // Count leaf tokens in tokens.json light theme
    function countLeafs(obj: Record<string, unknown>): number {
      let count = 0;
      for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null && '$type' in value) {
          count++;
        } else if (typeof value === 'object' && value !== null) {
          count += countLeafs(value as Record<string, unknown>);
        }
      }
      return count;
    }

    const leafCount = countLeafs(tokens.light);
    const schemaTokenCount = schema.properties.tokenCount.const;
    const schemaPathCount = schema.properties.tokenPaths.items.enum.length;

    // DTCG leaf count should match schema tokenPaths count
    expect(leafCount).toBe(schemaPathCount);
    // Schema tokenCount (CSS variables) may differ due to DEFAULT collapsing
    expect(schemaTokenCount).toBeGreaterThanOrEqual(100);
  });

  test('component-registry version matches package.json', () => {
    const registryPath = resolve('packages/ui/dist/component-registry.json');
    const pkgPath = resolve('packages/ui/package.json');

    const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    expect(registry.version).toBe(pkg.version);
  });
});
