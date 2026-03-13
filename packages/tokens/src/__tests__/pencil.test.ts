import { describe, expect, it } from 'vitest';
import {
  type PencilGetVariable,
  colorToHex,
  fromPencilGetVariables,
  fromPencilVariables,
  hslToHex,
  pencilBinding,
  pencilBindings,
  toPencilDocument,
  toPencilVariables,
} from '../formats/pencil';
import { defaultTheme } from '../presets/default';

describe('Pencil format', () => {
  it('generates correct variable names', () => {
    const vars = toPencilVariables(defaultTheme);
    expect(vars['hui-color-primary']).toBeDefined();
    expect(vars['hui-color-primary'].value).toBe('oklch(0.205 0.015 265)');
    expect(vars['hui-spacing-4']).toBeDefined();
    expect(vars['hui-spacing-4'].value).toBe('1rem');
  });

  it('collapses DEFAULT keys into parent name', () => {
    const vars = toPencilVariables(defaultTheme);
    // shadow.DEFAULT → hui-shadow (not hui-shadow-DEFAULT)
    expect(vars['hui-shadow']).toBeDefined();
    expect(vars['hui-shadow-DEFAULT']).toBeUndefined();
    // color.primary.DEFAULT → hui-color-primary
    expect(vars['hui-color-primary-DEFAULT']).toBeUndefined();
  });

  it('includes dark theme only for differing values', () => {
    const vars = toPencilVariables(defaultTheme);
    // color differs between themes
    expect(vars['hui-color-primary'].themes?.dark).toBeDefined();
    // spacing is the same in both themes
    expect(vars['hui-spacing-4'].themes).toBeUndefined();
  });

  it('excludes themes when includeThemes is false', () => {
    const vars = toPencilVariables(defaultTheme, { includeThemes: false });
    expect(vars['hui-color-primary'].themes).toBeUndefined();
  });

  it('filters by category', () => {
    const vars = toPencilVariables(defaultTheme, { categories: ['spacing'] });
    expect(vars['hui-spacing-4']).toBeDefined();
    expect(vars['hui-color-primary']).toBeUndefined();
    expect(vars['hui-radius-md']).toBeUndefined();
  });

  it('uses custom prefix', () => {
    const vars = toPencilVariables(defaultTheme, { prefix: 'custom' });
    expect(vars['custom-color-primary']).toBeDefined();
    expect(vars['hui-color-primary']).toBeUndefined();
  });

  it('includes easing tokens', () => {
    const vars = toPencilVariables(defaultTheme);
    expect(vars['hui-easing-out']).toBeDefined();
    expect(vars['hui-easing-out'].value).toBe('cubic-bezier(0, 0, 0.58, 1)');
  });

  it('includes z-index tokens', () => {
    const vars = toPencilVariables(defaultTheme);
    expect(vars['hui-z-index-dropdown']).toBeDefined();
    expect(vars['hui-z-index-dropdown'].value).toBe('50');
  });

  it('includes chart color tokens', () => {
    const vars = toPencilVariables(defaultTheme);
    expect(vars['hui-color-chart-1']).toBeDefined();
  });

  it('fromPencilVariables reconstructs nested structure', () => {
    const input = {
      'hui-color-background': { value: 'oklch(1 0 0)' },
      'hui-spacing-4': { value: '1rem' },
      'hui-font-size-sm': { value: '0.875rem' },
    };
    const result = fromPencilVariables(input);
    expect((result as unknown as Record<string, unknown>).color).toBeDefined();
    expect(
      ((result as unknown as Record<string, unknown>).color as Record<string, unknown>).background,
    ).toBe('oklch(1 0 0)');
    expect(
      ((result as unknown as Record<string, unknown>).spacing as Record<string, unknown>)['4'],
    ).toBe('1rem');
    expect(
      (
        ((result as unknown as Record<string, unknown>).font as Record<string, unknown>)
          .size as Record<string, unknown>
      ).sm,
    ).toBe('0.875rem');
  });

  it('fromPencilVariables reconstructs DEFAULT keys', () => {
    const input = {
      'hui-color-primary': { value: 'oklch(0.205 0.015 265)' },
      'hui-color-primary-foreground': { value: 'oklch(0.985 0 0)' },
    };
    const result = fromPencilVariables(input);
    expect(
      (
        ((result as unknown as Record<string, unknown>).color as Record<string, unknown>)
          .primary as Record<string, unknown>
      ).DEFAULT,
    ).toBe('oklch(0.205 0.015 265)');
    expect(
      (
        ((result as unknown as Record<string, unknown>).color as Record<string, unknown>)
          .primary as Record<string, unknown>
      ).foreground,
    ).toBe('oklch(0.985 0 0)');
  });

  it('round-trips toPencil → fromPencil preserving values', () => {
    const vars = toPencilVariables(defaultTheme, { includeThemes: false });
    const restored = fromPencilVariables(vars);
    // Check specific values are preserved
    expect(
      (
        ((restored as unknown as Record<string, unknown>).color as Record<string, unknown>)
          .primary as Record<string, unknown>
      ).DEFAULT,
    ).toBe('oklch(0.205 0.015 265)');
    expect(
      ((restored as unknown as Record<string, unknown>).spacing as Record<string, unknown>)['4'],
    ).toBe('1rem');
    expect(
      ((restored as unknown as Record<string, unknown>).shadow as Record<string, unknown>).DEFAULT,
    ).toBe('0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)');
  });
});

describe('hslToHex (backward compat)', () => {
  it('converts basic colors', () => {
    // Pure black
    expect(hslToHex('hsl(0 0% 0%)')).toBe('#000000');
    // Pure white
    expect(hslToHex('hsl(0 0% 100%)')).toBe('#ffffff');
    // Pure red
    expect(hslToHex('hsl(0 100% 50%)')).toBe('#ff0000');
    // Pure green
    expect(hslToHex('hsl(120 100% 50%)')).toBe('#00ff00');
    // Pure blue
    expect(hslToHex('hsl(240 100% 50%)')).toBe('#0000ff');
  });

  it('converts theme colors accurately', () => {
    const hex = hslToHex('hsl(240 5.9% 10%)');
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    expect(r).toBeLessThan(30);
    expect(g).toBeLessThan(30);
    expect(b).toBeLessThan(35);
  });

  it('handles alpha channel', () => {
    const hex = hslToHex('hsl(0 0% 0% / 0.8)');
    expect(hex).toMatch(/^#[0-9a-f]{8}$/);
    expect(hex).toBe('#000000cc');
  });

  it('throws on invalid input', () => {
    expect(() => hslToHex('rgb(0, 0, 0)')).toThrow('Invalid color string');
    expect(() => hslToHex('not-a-color')).toThrow('Invalid color string');
  });

  it('returns 6-char hex for full opacity', () => {
    const hex = hslToHex('hsl(0 0% 98%)');
    expect(hex).toHaveLength(7); // #RRGGBB
  });
});

describe('colorToHex', () => {
  it('converts OKLCH black', () => {
    expect(colorToHex('oklch(0 0 0)')).toBe('#000000');
  });

  it('converts OKLCH white', () => {
    expect(colorToHex('oklch(1 0 0)')).toBe('#ffffff');
  });

  it('converts OKLCH with alpha', () => {
    const hex = colorToHex('oklch(0 0 0 / 0.8)');
    expect(hex).toMatch(/^#[0-9a-f]{8}$/);
    expect(hex).toBe('#000000cc');
  });

  it('converts OKLCH primary color to dark hex', () => {
    const hex = colorToHex('oklch(0.205 0.015 265)');
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    // Should be very dark
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    expect(r).toBeLessThan(35);
    expect(g).toBeLessThan(35);
    expect(b).toBeLessThan(40);
  });

  it('converts OKLCH destructive color to reddish hex', () => {
    const hex = colorToHex('oklch(0.577 0.245 27.3)');
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    // Should be a reddish color (r > g and r > b)
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
  });

  it('converts OKLCH percentage lightness', () => {
    const hex = colorToHex('oklch(50% 0 0)');
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    // 50% lightness = mid-gray
    const r = Number.parseInt(hex.slice(1, 3), 16);
    expect(r).toBeGreaterThan(90);
    expect(r).toBeLessThan(160);
  });

  it('still supports HSL input', () => {
    expect(colorToHex('hsl(0 0% 0%)')).toBe('#000000');
    expect(colorToHex('hsl(0 0% 100%)')).toBe('#ffffff');
  });

  it('throws on invalid input', () => {
    expect(() => colorToHex('rgb(0, 0, 0)')).toThrow('Invalid color string');
  });
});

describe('toPencilDocument', () => {
  it('includes themes axis', () => {
    const doc = toPencilDocument(defaultTheme);
    expect(doc.themes).toEqual({ mode: ['light', 'dark'] });
  });

  it('produces color variables in hex format', () => {
    const doc = toPencilDocument(defaultTheme, { categories: ['color'] });
    const primary = doc.variables['hui-color-primary'];
    expect(primary).toBeDefined();
    expect(primary.type).toBe('color');
    // Should be array form (light/dark differ)
    expect(Array.isArray(primary.value)).toBe(true);
    const values = primary.value as Array<{
      value: string | number;
      theme?: Record<string, string>;
    }>;
    // Light value is hex
    expect(String(values[0].value)).toMatch(/^#[0-9a-f]{6,8}$/);
    // Dark entry has theme condition
    expect(values[1].theme).toEqual({ mode: 'dark' });
    expect(String(values[1].value)).toMatch(/^#[0-9a-f]{6,8}$/);
  });

  it('produces number type for spacing', () => {
    const doc = toPencilDocument(defaultTheme, { categories: ['spacing'] });
    const sp4 = doc.variables['hui-spacing-4'];
    expect(sp4).toBeDefined();
    expect(sp4.type).toBe('number');
    // 1rem = 16
    expect(sp4.value).toBe(16);
  });

  it('produces number type for radius', () => {
    const doc = toPencilDocument(defaultTheme, { categories: ['radius'] });
    const radMd = doc.variables['hui-radius-md'];
    expect(radMd).toBeDefined();
    expect(radMd.type).toBe('number');
    // 0.375rem = 6
    expect(radMd.value).toBe(6);
  });

  it('uses single value for non-themed variables', () => {
    const doc = toPencilDocument(defaultTheme, { categories: ['spacing'] });
    const sp4 = doc.variables['hui-spacing-4'];
    // spacing is identical between themes, should be single value not array
    expect(Array.isArray(sp4.value)).toBe(false);
  });

  it('uses array value for themed variables', () => {
    const doc = toPencilDocument(defaultTheme, { categories: ['color'] });
    const primary = doc.variables['hui-color-primary'];
    expect(Array.isArray(primary.value)).toBe(true);
  });

  it('produces string type for font/shadow/duration', () => {
    const doc = toPencilDocument(defaultTheme, { categories: ['font'] });
    const fontSans = doc.variables['hui-font-family-sans'];
    expect(fontSans).toBeDefined();
    expect(fontSans.type).toBe('string');
  });

  it('respects category filter', () => {
    const doc = toPencilDocument(defaultTheme, { categories: ['spacing'] });
    expect(doc.variables['hui-color-primary']).toBeUndefined();
    expect(doc.variables['hui-spacing-4']).toBeDefined();
  });

  it('disables themes when includeThemes is false', () => {
    const doc = toPencilDocument(defaultTheme, { includeThemes: false, categories: ['color'] });
    const primary = doc.variables['hui-color-primary'];
    // Should be single value, not array
    expect(Array.isArray(primary.value)).toBe(false);
    expect(String(primary.value)).toMatch(/^#[0-9a-f]{6,8}$/);
  });

  it('includes chart color variables', () => {
    const doc = toPencilDocument(defaultTheme, { categories: ['color'] });
    const chart1 = doc.variables['hui-color-chart-1'];
    expect(chart1).toBeDefined();
    expect(chart1.type).toBe('color');
  });
});

describe('fromPencilGetVariables', () => {
  it('handles single-value variables (values array with one entry)', () => {
    const response: Record<string, PencilGetVariable> = {
      'hui-spacing-4': { type: 'number', values: [{ value: 16 }] },
    };
    const result = fromPencilGetVariables(response);
    const spacing = (result as unknown as Record<string, unknown>).spacing as Record<
      string,
      unknown
    >;
    expect(spacing['4']).toBe('16');
  });

  it('handles themed variables (takes first/default)', () => {
    const response: Record<string, PencilGetVariable> = {
      'hui-color-primary': {
        type: 'color',
        values: [{ value: '#18181b' }, { value: '#fafafa', theme: {} }],
      },
    };
    const result = fromPencilGetVariables(response);
    const color = (result as unknown as Record<string, unknown>).color as Record<string, unknown>;
    const primary = color.primary as string;
    expect(primary).toBe('#18181b');
  });

  it('reconstructs nested structure', () => {
    const response: Record<string, PencilGetVariable> = {
      'hui-color-primary': {
        name: 'hui-color-primary',
        type: 'color',
        values: [{ value: '#18181b' }, { value: '#fafafa', theme: {} }],
      },
      'hui-color-primary-foreground': {
        name: 'hui-color-primary-foreground',
        type: 'color',
        values: [{ value: '#fafafa' }, { value: '#18181b', theme: {} }],
      },
    };
    const result = fromPencilGetVariables(response);
    const color = (result as unknown as Record<string, unknown>).color as Record<string, unknown>;
    const primary = color.primary as Record<string, unknown>;
    expect(primary.DEFAULT).toBe('#18181b');
    expect(primary.foreground).toBe('#fafafa');
  });

  it('skips variables with wrong prefix', () => {
    const response: Record<string, PencilGetVariable> = {
      'other-color-primary': { type: 'color', values: [{ value: '#000000' }] },
      'hui-spacing-4': { type: 'number', values: [{ value: 16 }] },
    };
    const result = fromPencilGetVariables(response);
    expect((result as unknown as Record<string, unknown>).color).toBeUndefined();
    expect(
      ((result as unknown as Record<string, unknown>).spacing as Record<string, unknown>)['4'],
    ).toBe('16');
  });
});

describe('pencilBinding', () => {
  it('returns $-prefixed string', () => {
    expect(pencilBinding('hui-color-primary')).toBe('$hui-color-primary');
  });

  it('works with arbitrary names', () => {
    expect(pencilBinding('foo')).toBe('$foo');
  });
});

describe('pencilBindings', () => {
  it('generates bindings for all variables', () => {
    const bindings = pencilBindings(defaultTheme);
    expect(bindings['hui-color-primary']).toBe('$hui-color-primary');
    expect(bindings['hui-spacing-4']).toBe('$hui-spacing-4');
    expect(bindings['hui-radius-md']).toBe('$hui-radius-md');
  });

  it('respects category filter', () => {
    const bindings = pencilBindings(defaultTheme, { categories: ['color'] });
    expect(bindings['hui-color-primary']).toBe('$hui-color-primary');
    expect(bindings['hui-spacing-4']).toBeUndefined();
  });

  it('uses custom prefix', () => {
    const bindings = pencilBindings(defaultTheme, { prefix: 'custom' });
    expect(bindings['custom-color-primary']).toBe('$custom-color-primary');
    expect(bindings['hui-color-primary']).toBeUndefined();
  });

  it('includes easing and z-index bindings', () => {
    const bindings = pencilBindings(defaultTheme);
    expect(bindings['hui-easing-out']).toBe('$hui-easing-out');
    expect(bindings['hui-z-index-dropdown']).toBe('$hui-z-index-dropdown');
  });
});
