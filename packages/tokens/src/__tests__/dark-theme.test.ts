import { describe, expect, it } from 'vitest';
import { generateDarkTokens } from '../dark-theme';
import { parseOKLCH } from '../oklch';
import { defaultTheme } from '../presets/default';
import type { HareruTokens } from '../types';

describe('generateDarkTokens', () => {
  const dark = generateDarkTokens(defaultTheme.light);

  describe('lightness inversion', () => {
    it('inverts dark color (L=0.205) to light (L≈0.795)', () => {
      const parsed = parseOKLCH(dark.color.primary.DEFAULT);
      expect(parsed).not.toBeNull();
      expect(parsed?.l).toBeCloseTo(0.795, 2);
    });

    it('inverts light color (L=0.985) to dark (L≈0.015)', () => {
      const parsed = parseOKLCH(dark.color.primary.foreground);
      expect(parsed).not.toBeNull();
      expect(parsed?.l).toBeCloseTo(0.015, 2);
    });

    it('inverts background (L=1) to dark (L=0)', () => {
      const parsed = parseOKLCH(dark.color.background);
      expect(parsed).not.toBeNull();
      expect(parsed?.l).toBeCloseTo(0, 2);
    });

    it('inverts foreground (L=0.145) to light (L≈0.855)', () => {
      const parsed = parseOKLCH(dark.color.foreground);
      expect(parsed).not.toBeNull();
      expect(parsed?.l).toBeCloseTo(0.855, 2);
    });
  });

  describe('chroma adjustment', () => {
    it('reduces chroma for bright colors (L >= 0.8)', () => {
      // secondary DEFAULT has L=0.965, C=0.003
      const lightParsed = parseOKLCH(defaultTheme.light.color.secondary.DEFAULT);
      const darkParsed = parseOKLCH(dark.color.secondary.DEFAULT);
      expect(lightParsed).not.toBeNull();
      expect(darkParsed).not.toBeNull();
      // L=0.965 >= 0.8 → chroma × 0.7
      expect(darkParsed?.c).toBeCloseTo(lightParsed?.c * 0.7, 4);
    });

    it('moderately reduces chroma for mid-range colors (0.4 < L < 0.8)', () => {
      // destructive DEFAULT has L=0.577, C=0.245
      const lightParsed = parseOKLCH(defaultTheme.light.color.destructive.DEFAULT);
      const darkParsed = parseOKLCH(dark.color.destructive.DEFAULT);
      expect(lightParsed).not.toBeNull();
      expect(darkParsed).not.toBeNull();
      // L=0.577 → chroma × 0.85 (3 decimals due to formatOKLCH rounding)
      expect(darkParsed?.c).toBeCloseTo(lightParsed?.c * 0.85, 3);
    });

    it('preserves chroma for dark colors (L <= 0.4)', () => {
      // primary DEFAULT has L=0.205, C=0.015
      const lightParsed = parseOKLCH(defaultTheme.light.color.primary.DEFAULT);
      const darkParsed = parseOKLCH(dark.color.primary.DEFAULT);
      expect(lightParsed).not.toBeNull();
      expect(darkParsed).not.toBeNull();
      // L=0.205 <= 0.4 → chroma × 1.0
      expect(darkParsed?.c).toBeCloseTo(lightParsed?.c, 4);
    });

    it('boundary: L=0.8 uses bright chroma factor (×0.7)', () => {
      const tokens: HareruTokens = {
        ...defaultTheme.light,
        color: {
          ...defaultTheme.light.color,
          primary: { DEFAULT: 'oklch(0.8 0.1 265)', foreground: 'oklch(0.2 0 0)' },
        },
      };
      const result = generateDarkTokens(tokens);
      const parsed = parseOKLCH(result.color.primary.DEFAULT);
      expect(parsed).not.toBeNull();
      // L=0.8 >= 0.8 → chroma × 0.7
      expect(parsed?.c).toBeCloseTo(0.1 * 0.7, 3);
    });

    it('boundary: L=0.4 uses full chroma factor (×1.0)', () => {
      const tokens: HareruTokens = {
        ...defaultTheme.light,
        color: {
          ...defaultTheme.light.color,
          primary: { DEFAULT: 'oklch(0.4 0.1 265)', foreground: 'oklch(0.9 0 0)' },
        },
      };
      const result = generateDarkTokens(tokens);
      const parsed = parseOKLCH(result.color.primary.DEFAULT);
      expect(parsed).not.toBeNull();
      // L=0.4 (not > 0.4) → falls to else → chroma × 1.0
      expect(parsed?.c).toBeCloseTo(0.1, 3);
    });
  });

  describe('color passthrough', () => {
    it('preserves OKLCH colors with alpha unchanged (e.g., overlay)', () => {
      expect(dark.color.overlay).toBe(defaultTheme.light.color.overlay);
    });
  });

  describe('shadow opacity', () => {
    it('multiplies shadow opacity by 4.0', () => {
      // sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)' → opacity 0.05 * 4 = 0.2
      expect(dark.shadow.sm).toBe('0 1px 2px 0 rgb(0 0 0 / 0.2)');
    });

    it('handles multi-shadow values', () => {
      // DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
      expect(dark.shadow.DEFAULT).toBe(
        '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      );
    });

    it('clamps opacity to 1.0', () => {
      // If opacity * 4 > 1, clamp to 1
      const result = generateDarkTokens({
        ...defaultTheme.light,
        shadow: { test: '0 1px 2px 0 rgb(0 0 0 / 0.3)' },
      });
      // 0.3 * 4 = 1.2 → clamped to 1
      expect(result.shadow.test).toBe('0 1px 2px 0 rgb(0 0 0 / 1)');
    });
  });

  describe('unchanged categories', () => {
    it('preserves spacing', () => {
      expect(dark.spacing).toEqual(defaultTheme.light.spacing);
    });

    it('preserves radius', () => {
      expect(dark.radius).toEqual(defaultTheme.light.radius);
    });

    it('preserves font', () => {
      expect(dark.font).toEqual(defaultTheme.light.font);
    });

    it('preserves typography', () => {
      expect(dark.typography).toEqual(defaultTheme.light.typography);
    });

    it('preserves duration', () => {
      expect(dark.duration).toEqual(defaultTheme.light.duration);
    });

    it('preserves easing', () => {
      expect(dark.easing).toEqual(defaultTheme.light.easing);
    });

    it('preserves zIndex', () => {
      expect(dark.zIndex).toEqual(defaultTheme.light.zIndex);
    });
  });

  describe('custom options', () => {
    it('respects custom shadow opacity multiplier', () => {
      const result = generateDarkTokens(defaultTheme.light, {
        shadowOpacityMultiplier: 2.0,
      });
      // sm: opacity 0.05 * 2 = 0.1
      expect(result.shadow.sm).toBe('0 1px 2px 0 rgb(0 0 0 / 0.1)');
    });
  });

  describe('comparison with hand-written dark tokens', () => {
    it('generates structurally valid dark tokens', () => {
      // Verify the generated dark has all the same keys as hand-written dark
      const handWritten = defaultTheme.dark;
      const generated = dark;

      expect(Object.keys(generated.color)).toEqual(Object.keys(handWritten.color));
      expect(Object.keys(generated.shadow)).toEqual(Object.keys(handWritten.shadow));
    });

    it('chart colors are all valid OKLCH', () => {
      for (const [key, value] of Object.entries(dark.color.chart)) {
        const parsed = parseOKLCH(value);
        expect(parsed, `chart.${key} should be valid OKLCH`).not.toBeNull();
      }
    });
  });
});
