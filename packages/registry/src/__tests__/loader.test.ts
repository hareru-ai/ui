import { describe, expect, it } from 'vitest';
import {
  loadComponentSchema,
  loadConsumerRules,
  loadRegistry,
  loadSchema,
  loadTokens,
} from '../loader.js';

describe('loadTokens', () => {
  it('returns light and dark themes', () => {
    const tokens = loadTokens();
    expect(tokens).toHaveProperty('light');
    expect(tokens).toHaveProperty('dark');
  });

  it('contains color tokens in light theme', () => {
    const tokens = loadTokens();
    expect(tokens.light).toHaveProperty('color');
  });

  it('returns cached result on second call', () => {
    const a = loadTokens();
    const b = loadTokens();
    expect(a).toBe(b);
  });
});

describe('loadSchema', () => {
  it('returns valid JSON Schema', () => {
    const schema = loadSchema();
    expect(schema.$schema).toContain('json-schema.org');
    expect(schema.title).toBe('Hareru UI Design Tokens');
  });

  it('contains cssVariables enum', () => {
    const schema = loadSchema();
    const vars = schema.properties.cssVariables.items.enum;
    expect(vars.length).toBeGreaterThan(0);
    expect(vars).toContain('--hui-color-primary');
  });

  it('contains typeConstraints with color pattern', () => {
    const schema = loadSchema();
    const colorConstraint = schema.properties.typeConstraints.properties.color;
    expect(colorConstraint).toBeDefined();
    expect(colorConstraint.pattern).toContain('oklch');
  });
});

describe('loadRegistry', () => {
  it('returns component registry with correct structure', () => {
    const registry = loadRegistry();
    expect(registry.name).toBe('@hareru/ui');
    expect(registry.componentCount).toBeGreaterThan(0);
    expect(registry.components.length).toBe(registry.componentCount);
  });

  it('contains Button component', () => {
    const registry = loadRegistry();
    const button = registry.components.find((c) => c.name === 'Button');
    expect(button).toBeDefined();
    expect(button?.displayName).toBe('Button');
  });

  it('Button has variant definitions', () => {
    const registry = loadRegistry();
    const button = registry.components.find((c) => c.name === 'Button');
    expect(button?.variants?.length).toBeGreaterThan(0);
  });

  it('every component has componentSource and description', () => {
    const registry = loadRegistry();
    for (const comp of registry.components) {
      expect(comp.componentSource, `${comp.name} componentSource`).toBeTruthy();
      expect(comp.description, `${comp.name} description`).toBeTruthy();
    }
  });

  it('has taskBundles with at least 1 entry', () => {
    const registry = loadRegistry();
    expect(registry.taskBundles).toBeDefined();
    expect(registry.taskBundles?.length).toBeGreaterThanOrEqual(1);
  });

  it('AlertDialog displayName matches component name', () => {
    const registry = loadRegistry();
    const ad = registry.components.find((c) => c.name === 'AlertDialog');
    expect(ad?.displayName).toBe('AlertDialog');
  });

  it('BentoGrid subcomponents does not include constants', () => {
    const registry = loadRegistry();
    const bg = registry.components.find((c) => c.name === 'BentoGrid');
    expect(bg?.subcomponents).not.toContain('BENTO_PRESETS');
  });

  it('BentoGrid props has no bogus "default" property', () => {
    const registry = loadRegistry();
    const bg = registry.components.find((c) => c.name === 'BentoGrid');
    const allCustomProps = bg?.props?.flatMap((p) => p.customProps ?? []) ?? [];
    expect(allCustomProps.find((p) => p.name === 'default')).toBeUndefined();
  });
});

describe('loadComponentSchema', () => {
  it('returns valid JSON Schema', () => {
    const schema = loadComponentSchema();
    expect(schema.$schema).toContain('json-schema.org');
    expect(schema.properties).toBeDefined();
  });

  it('defines component entry structure', () => {
    const schema = loadComponentSchema();
    expect(schema.properties).toHaveProperty('components');
  });
});

describe('loadConsumerRules', () => {
  it('returns consumer rules with version', () => {
    const rules = loadConsumerRules();
    expect(rules.version).toBeDefined();
  });

  it('contains cssImports rules', () => {
    const rules = loadConsumerRules();
    expect(rules.rules).toHaveProperty('cssImports');
    expect(rules.rules.cssImports.rules.length).toBeGreaterThan(0);
  });

  it('contains tokenQuickReference', () => {
    const rules = loadConsumerRules();
    expect(rules.tokenQuickReference).toHaveProperty('color');
    expect(rules.tokenQuickReference).toHaveProperty('spacing');
  });
});
