import { describe, expect, it } from 'vitest';
import { flattenTokens } from '../formats/css';
import { toJSONSchema } from '../formats/schema';
import { defaultTheme } from '../presets/default';

describe('toJSONSchema', () => {
  const schema = toJSONSchema(defaultTheme);

  it('produces a valid JSON Schema structure', () => {
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(schema.title).toBe('Hareru UI Design Tokens');
    expect(schema.type).toBe('object');
    expect(schema.additionalProperties).toBe(false);
  });

  it('has cssVariables, tokenPaths, typeConstraints, and tokenCount', () => {
    expect(schema.properties.cssVariables).toBeDefined();
    expect(schema.properties.tokenPaths).toBeDefined();
    expect(schema.properties.typeConstraints).toBeDefined();
    expect(schema.properties.tokenCount).toBeDefined();
  });

  it('cssVariables enum matches flattenTokens output', () => {
    const flat = flattenTokens(defaultTheme.light as unknown as Record<string, unknown>);
    const cssVarEnum = (
      schema.properties.cssVariables as {
        items: { enum: string[] };
      }
    ).items.enum;
    const expectedVars = Array.from(flat.keys()).sort();

    expect(cssVarEnum).toEqual(expectedVars);
  });

  it('all cssVariables start with --hui-', () => {
    const cssVarEnum = (
      schema.properties.cssVariables as {
        items: { enum: string[] };
      }
    ).items.enum;

    for (const v of cssVarEnum) {
      expect(v).toMatch(/^--hui-/);
    }
  });

  it('tokenPaths include key paths', () => {
    const tokenPathEnum = (
      schema.properties.tokenPaths as {
        items: { enum: string[] };
      }
    ).items.enum;

    expect(tokenPathEnum).toContain('color.primary.DEFAULT');
    expect(tokenPathEnum).toContain('color.background');
    expect(tokenPathEnum).toContain('spacing.4');
    expect(tokenPathEnum).toContain('radius.md');
    expect(tokenPathEnum).toContain('font.family.sans');
    expect(tokenPathEnum).toContain('duration.fast');
    expect(tokenPathEnum).toContain('easing.out');
    expect(tokenPathEnum).toContain('zIndex.dropdown');
  });

  it('typeConstraints has pattern for color type', () => {
    const constraints = (
      schema.properties.typeConstraints as {
        properties: Record<string, { pattern?: string }>;
      }
    ).properties;

    expect(constraints.color.pattern).toBeDefined();
    expect(constraints.color.pattern).toContain('oklch');
  });

  it('typeConstraints has pattern for dimension type', () => {
    const constraints = (
      schema.properties.typeConstraints as {
        properties: Record<string, { pattern?: string }>;
      }
    ).properties;

    expect(constraints.dimension.pattern).toBeDefined();
    expect(constraints.dimension.pattern).toContain('rem');
  });

  it('tokenCount matches cssVariables length', () => {
    const cssVarEnum = (
      schema.properties.cssVariables as {
        items: { enum: string[] };
      }
    ).items.enum;
    const tokenCount = schema.properties.tokenCount as { const: number };

    expect(tokenCount.const).toBe(cssVarEnum.length);
  });

  it('is JSON-serializable', () => {
    const json = JSON.stringify(schema);
    const parsed = JSON.parse(json);
    expect(parsed.$schema).toBe(schema.$schema);
    expect(parsed.properties.cssVariables).toBeDefined();
  });
});
