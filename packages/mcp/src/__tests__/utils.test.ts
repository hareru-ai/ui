import { describe, expect, it } from 'vitest';
import { loadRegistry, loadSchema, loadTokens } from '../utils.js';

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
});
