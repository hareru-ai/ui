import { describe, expect, it } from 'vitest';
import { flattenTokens, generateThemeCSS, toCSS } from '../formats/css';
import { toDTCG } from '../formats/dtcg';
import { TokenGenerator } from '../generator';
import { defaultTheme } from '../presets/default';

describe('flattenTokens', () => {
  it('flattens simple key-value pairs', () => {
    const tokens = { spacing: { '1': '0.25rem', '4': '1rem' } };
    const result = flattenTokens(tokens);
    expect(result.get('--hui-spacing-1')).toBe('0.25rem');
    expect(result.get('--hui-spacing-4')).toBe('1rem');
  });

  it('collapses DEFAULT key into parent name', () => {
    const tokens = {
      color: { primary: { DEFAULT: 'oklch(0.205 0.015 265)', foreground: 'oklch(0.985 0 0)' } },
    };
    const result = flattenTokens(tokens);
    expect(result.get('--hui-color-primary')).toBe('oklch(0.205 0.015 265)');
    expect(result.get('--hui-color-primary-foreground')).toBe('oklch(0.985 0 0)');
  });

  it('handles top-level DEFAULT (shadow.DEFAULT)', () => {
    const tokens = { shadow: { DEFAULT: '0 1px 3px', md: '0 4px 6px' } };
    const result = flattenTokens(tokens);
    expect(result.get('--hui-shadow')).toBe('0 1px 3px');
    expect(result.get('--hui-shadow-md')).toBe('0 4px 6px');
  });

  it('handles deeply nested keys', () => {
    const tokens = { font: { family: { sans: 'Inter' } } };
    const result = flattenTokens(tokens);
    expect(result.get('--hui-font-family-sans')).toBe('Inter');
  });

  it('returns empty Map for empty object', () => {
    const result = flattenTokens({});
    expect(result.size).toBe(0);
  });

  it('handles numeric string keys', () => {
    const tokens = { spacing: { '0': '0px', '1': '0.25rem' } };
    const result = flattenTokens(tokens);
    expect(result.get('--hui-spacing-0')).toBe('0px');
    expect(result.get('--hui-spacing-1')).toBe('0.25rem');
  });

  it('skips null and undefined values', () => {
    const tokens = {
      color: { valid: 'red', empty: null, missing: undefined },
    };
    const result = flattenTokens(tokens as Record<string, unknown>);
    expect(result.get('--hui-color-valid')).toBe('red');
    expect(result.has('--hui-color-empty')).toBe(false);
    expect(result.has('--hui-color-missing')).toBe(false);
  });

  it('converts camelCase keys to kebab-case', () => {
    const tokens = { zIndex: { base: '10', dropdown: '50' } };
    const result = flattenTokens(tokens);
    expect(result.get('--hui-z-index-base')).toBe('10');
    expect(result.get('--hui-z-index-dropdown')).toBe('50');
  });

  it('flattens easing tokens correctly', () => {
    const tokens = {
      easing: { out: 'cubic-bezier(0, 0, 0.58, 1)', 'in-out': 'cubic-bezier(0.42, 0, 0.58, 1)' },
    };
    const result = flattenTokens(tokens);
    expect(result.get('--hui-easing-out')).toBe('cubic-bezier(0, 0, 0.58, 1)');
    expect(result.get('--hui-easing-in-out')).toBe('cubic-bezier(0.42, 0, 0.58, 1)');
  });

  it('flattens chart color tokens correctly', () => {
    const tokens = { color: { chart: { '1': 'oklch(0.646 0.222 41.1)' } } };
    const result = flattenTokens(tokens);
    expect(result.get('--hui-color-chart-1')).toBe('oklch(0.646 0.222 41.1)');
  });
});

describe('toCSS', () => {
  it('generates CSS with :root selector by default', () => {
    const tokens = { color: { background: 'white' } } as never;
    const css = toCSS(tokens);
    expect(css).toContain(':root {');
    expect(css).toContain('--hui-color-background: white;');
    expect(css).toContain('}');
  });

  it('uses custom selector', () => {
    const tokens = { color: { background: 'black' } } as never;
    const css = toCSS(tokens, '[data-theme="dark"]');
    expect(css).toContain('[data-theme="dark"] {');
  });
});

describe('generateThemeCSS', () => {
  it('generates :root for light and [data-theme="dark"] for dark', () => {
    const css = generateThemeCSS(defaultTheme.light, defaultTheme.dark);
    expect(css).toContain(':root {');
    expect(css).toContain('[data-theme="dark"] {');
  });

  it('includes overlay color token', () => {
    const css = generateThemeCSS(defaultTheme.light, defaultTheme.dark);
    expect(css).toContain('--hui-color-overlay');
  });

  it('only includes overridden tokens in dark block', () => {
    const css = generateThemeCSS(defaultTheme.light, defaultTheme.dark);
    // spacing is shared, should NOT appear in dark block
    const darkBlock = css.split('[data-theme="dark"]')[1];
    expect(darkBlock).not.toContain('--hui-spacing-');
    expect(darkBlock).not.toContain('--hui-radius-');
    expect(darkBlock).not.toContain('--hui-font-');
    expect(darkBlock).not.toContain('--hui-duration-');
    expect(darkBlock).not.toContain('--hui-easing-');
    expect(darkBlock).not.toContain('--hui-z-index-');
    // color should appear in dark block
    expect(darkBlock).toContain('--hui-color-background');
    expect(darkBlock).toContain('--hui-shadow');
  });

  it('includes new token categories in light block', () => {
    const css = generateThemeCSS(defaultTheme.light, defaultTheme.dark);
    expect(css).toContain('--hui-easing-out');
    expect(css).toContain('--hui-easing-in-out');
    expect(css).toContain('--hui-z-index-dropdown');
    expect(css).toContain('--hui-z-index-toast');
    expect(css).toContain('--hui-color-chart-1');
    expect(css).toContain('--hui-font-size-5xl');
    expect(css).toContain('--hui-font-size-6xl');
  });

  it('uses OKLCH color values', () => {
    const css = generateThemeCSS(defaultTheme.light, defaultTheme.dark);
    expect(css).toContain('oklch(');
    expect(css).not.toContain('hsl(');
  });
});

describe('toDTCG', () => {
  it('converts color tokens with correct $type', () => {
    const result = toDTCG(defaultTheme.light);
    const bg = result.color as Record<string, { $type: string; $value: string }>;
    expect(bg.background.$type).toBe('color');
    expect(bg.background.$value).toBe('oklch(1 0 0)');
  });

  it('converts spacing tokens with dimension $type', () => {
    const result = toDTCG(defaultTheme.light);
    const sp = result.spacing as Record<string, { $type: string; $value: string }>;
    expect(sp['4'].$type).toBe('dimension');
    expect(sp['4'].$value).toBe('1rem');
  });

  it('converts font.family tokens with fontFamily $type', () => {
    const result = toDTCG(defaultTheme.light);
    const font = result.font as Record<string, Record<string, { $type: string; $value: string }>>;
    expect(font.family.sans.$type).toBe('fontFamily');
  });

  it('converts duration tokens with duration $type', () => {
    const result = toDTCG(defaultTheme.light);
    const dur = result.duration as Record<string, { $type: string; $value: string }>;
    expect(dur.fast.$type).toBe('duration');
    expect(dur.fast.$value).toBe('100ms');
  });

  it('preserves nested structure for color scales', () => {
    const result = toDTCG(defaultTheme.light);
    const color = result.color as Record<string, Record<string, { $type: string; $value: string }>>;
    expect(color.primary.DEFAULT.$type).toBe('color');
    expect(color.primary.foreground.$type).toBe('color');
  });

  it('converts easing tokens with cubicBezier $type', () => {
    const result = toDTCG(defaultTheme.light);
    const easing = result.easing as Record<string, { $type: string; $value: string }>;
    expect(easing.out.$type).toBe('cubicBezier');
    expect(easing.out.$value).toBe('cubic-bezier(0, 0, 0.58, 1)');
  });

  it('converts zIndex tokens with number $type', () => {
    const result = toDTCG(defaultTheme.light);
    const zi = result.zIndex as Record<string, { $type: string; $value: string }>;
    expect(zi.dropdown.$type).toBe('number');
    expect(zi.dropdown.$value).toBe('50');
  });

  it('converts font.tracking tokens with dimension $type', () => {
    const result = toDTCG(defaultTheme.light);
    const font = result.font as Record<string, Record<string, { $type: string; $value: string }>>;
    expect(font.tracking.tight.$type).toBe('dimension');
  });

  it('converts chart color tokens with color $type', () => {
    const result = toDTCG(defaultTheme.light);
    const color = result.color as Record<string, Record<string, { $type: string; $value: string }>>;
    expect(color.chart['1'].$type).toBe('color');
  });
});

describe('toDTCG output structure (tokens.json)', () => {
  it('produces light and dark DTCG groups', () => {
    const light = toDTCG(defaultTheme.light);
    const dark = toDTCG(defaultTheme.dark);
    expect(light.color).toBeDefined();
    expect(light.spacing).toBeDefined();
    expect(light.radius).toBeDefined();
    expect(light.font).toBeDefined();
    expect(light.typography).toBeDefined();
    expect(light.shadow).toBeDefined();
    expect(light.duration).toBeDefined();
    expect(light.easing).toBeDefined();
    expect(light.zIndex).toBeDefined();
    expect(dark.color).toBeDefined();
  });

  it('all leaf tokens have $type and $value', () => {
    const dtcg = toDTCG(defaultTheme.light);

    function assertTokens(obj: Record<string, unknown>, path = ''): void {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === 'object' && value !== null && '$type' in value && '$value' in value) {
          const token = value as { $type: string; $value: unknown };
          expect(token.$type).toBeTruthy();
          expect(token.$value).toBeDefined();
        } else if (typeof value === 'object' && value !== null) {
          assertTokens(value as Record<string, unknown>, currentPath);
        }
      }
    }

    assertTokens(dtcg as unknown as Record<string, unknown>);
  });

  it('DTCG output is JSON-serializable', () => {
    const dtcg = toDTCG(defaultTheme.light);
    const json = JSON.stringify({ light: dtcg, dark: toDTCG(defaultTheme.dark) });
    const parsed = JSON.parse(json);
    expect(parsed.light.color).toBeDefined();
    expect(parsed.dark.color).toBeDefined();
  });
});

describe('TokenGenerator (facade)', () => {
  it('toCSS delegates to format', () => {
    const css = TokenGenerator.toCSS(defaultTheme.light);
    expect(css).toContain(':root {');
    expect(css).toContain('--hui-color-primary:');
  });

  it('toDTCG delegates to format', () => {
    const result = TokenGenerator.toDTCG(defaultTheme.light);
    expect(result.color).toBeDefined();
    expect(result.spacing).toBeDefined();
  });

  it('generateThemeCSS delegates to format', () => {
    const css = TokenGenerator.generateThemeCSS(defaultTheme);
    expect(css).toContain(':root {');
    expect(css).toContain('[data-theme="dark"]');
  });

  it('toJSONSchema delegates to format', () => {
    const schema = TokenGenerator.toJSONSchema(defaultTheme);
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(schema.properties.cssVariables).toBeDefined();
    expect(schema.properties.tokenCount).toBeDefined();
  });
});
