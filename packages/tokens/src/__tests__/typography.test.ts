import { describe, expect, it } from 'vitest';
import { generateDarkTokens } from '../dark-theme';
import { flattenTokens, generateThemeCSS } from '../formats/css';
import { toDTCG } from '../formats/dtcg';
import { toPencilDocument } from '../formats/pencil';
import { defaultTheme } from '../presets/default';

describe('typography tokens', () => {
  describe('CSS variable generation', () => {
    it('flattens typography tokens to --hui-typography-* variables', () => {
      const flat = flattenTokens(defaultTheme.light as unknown as Record<string, unknown>);
      expect(flat.get('--hui-typography-h1-font-size')).toBe('2.25rem');
      expect(flat.get('--hui-typography-h1-font-weight')).toBe('700');
      expect(flat.get('--hui-typography-h1-line-height')).toBe('1.25');
      expect(flat.get('--hui-typography-h1-letter-spacing')).toBe('-0.025em');
    });

    it('flattens all 7 typography variants including letter-spacing', () => {
      const flat = flattenTokens(defaultTheme.light as unknown as Record<string, unknown>);
      const variants = ['h1', 'h2', 'h3', 'h4', 'body', 'body-sm', 'caption'];
      for (const variant of variants) {
        expect(
          flat.has(`--hui-typography-${variant}-font-size`),
          `missing --hui-typography-${variant}-font-size`,
        ).toBe(true);
        expect(
          flat.has(`--hui-typography-${variant}-font-weight`),
          `missing --hui-typography-${variant}-font-weight`,
        ).toBe(true);
        expect(
          flat.has(`--hui-typography-${variant}-line-height`),
          `missing --hui-typography-${variant}-line-height`,
        ).toBe(true);
        expect(
          flat.has(`--hui-typography-${variant}-letter-spacing`),
          `missing --hui-typography-${variant}-letter-spacing`,
        ).toBe(true);
      }
    });

    it('correctly flattens hyphenated key body-sm', () => {
      const flat = flattenTokens(defaultTheme.light as unknown as Record<string, unknown>);
      expect(flat.get('--hui-typography-body-sm-font-size')).toBe('0.875rem');
      expect(flat.get('--hui-typography-body-sm-font-weight')).toBe('400');
      expect(flat.get('--hui-typography-body-sm-line-height')).toBe('1.5');
      expect(flat.get('--hui-typography-body-sm-letter-spacing')).toBe('0em');
    });
  });

  describe('utility CSS class generation', () => {
    it('generates .hui-typography-h1 class', () => {
      const css = generateThemeCSS(defaultTheme.light, defaultTheme.dark);
      expect(css).toContain('.hui-typography-h1 {');
      expect(css).toContain('font-size: var(--hui-typography-h1-font-size);');
      expect(css).toContain('font-weight: var(--hui-typography-h1-font-weight);');
      expect(css).toContain('line-height: var(--hui-typography-h1-line-height);');
      expect(css).toContain('letter-spacing: var(--hui-typography-h1-letter-spacing);');
    });

    it('generates classes for all 7 variants', () => {
      const css = generateThemeCSS(defaultTheme.light, defaultTheme.dark);
      const variants = ['h1', 'h2', 'h3', 'h4', 'body', 'body-sm', 'caption'];
      for (const variant of variants) {
        expect(css, `missing .hui-typography-${variant}`).toContain(`.hui-typography-${variant} {`);
      }
    });
  });

  describe('DTCG output', () => {
    it('outputs typography tokens with typography $type', () => {
      const result = toDTCG(defaultTheme.light);
      const typo = result.typography as Record<
        string,
        { $type: string; $value: Record<string, string> }
      >;
      expect(typo.h1.$type).toBe('typography');
      expect(typo.h1.$value.fontSize).toBe('2.25rem');
      expect(typo.h1.$value.fontWeight).toBe('700');
      expect(typo.h1.$value.lineHeight).toBe('1.25');
      expect(typo.h1.$value.letterSpacing).toBe('-0.025em');
    });
  });

  describe('dark theme', () => {
    it('shares typography between light and dark', () => {
      const dark = generateDarkTokens(defaultTheme.light);
      expect(dark.typography).toEqual(defaultTheme.light.typography);
    });

    it('does not include typography in dark CSS overrides', () => {
      const css = generateThemeCSS(defaultTheme.light, defaultTheme.dark);
      const darkBlock = css.split('[data-theme="dark"]')[1].split('}')[0];
      expect(darkBlock).not.toContain('--hui-typography-');
    });
  });

  describe('Pencil conversion', () => {
    it('includes typography variables as string type', () => {
      const doc = toPencilDocument(defaultTheme, { categories: ['typography'] });
      expect(doc.variables['hui-typography-h1-font-size']).toBeDefined();
      expect(doc.variables['hui-typography-h1-font-size'].type).toBe('string');
      expect(doc.variables['hui-typography-h1-font-size'].value).toBe('2.25rem');
    });

    it('includes all typography variants in pencil output', () => {
      const doc = toPencilDocument(defaultTheme, { categories: ['typography'] });
      const varNames = Object.keys(doc.variables);
      expect(varNames.some((n) => n.includes('typography-h1'))).toBe(true);
      expect(varNames.some((n) => n.includes('typography-body'))).toBe(true);
      expect(varNames.some((n) => n.includes('typography-caption'))).toBe(true);
    });
  });
});
