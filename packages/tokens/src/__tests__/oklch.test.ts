import { describe, expect, it } from 'vitest';
import { type OKLCHColor, formatOKLCH, parseOKLCH } from '../oklch';

describe('parseOKLCH', () => {
  it('parses basic OKLCH string', () => {
    expect(parseOKLCH('oklch(0.5 0.1 265)')).toEqual({ l: 0.5, c: 0.1, h: 265 });
  });

  it('parses OKLCH with alpha', () => {
    expect(parseOKLCH('oklch(0.205 0.015 265 / 0.8)')).toEqual({
      l: 0.205,
      c: 0.015,
      h: 265,
      alpha: 0.8,
    });
  });

  it('parses percentage lightness', () => {
    expect(parseOKLCH('oklch(50% 0.1 265)')).toEqual({ l: 0.5, c: 0.1, h: 265 });
  });

  it('parses zero values', () => {
    expect(parseOKLCH('oklch(0 0 0)')).toEqual({ l: 0, c: 0, h: 0 });
  });

  it('parses lightness of 1', () => {
    expect(parseOKLCH('oklch(1 0 0)')).toEqual({ l: 1, c: 0, h: 0 });
  });

  it('returns null for non-OKLCH strings', () => {
    expect(parseOKLCH('hsl(240 5.9% 10%)')).toBeNull();
    expect(parseOKLCH('#ff0000')).toBeNull();
    expect(parseOKLCH('rgb(255, 0, 0)')).toBeNull();
    expect(parseOKLCH('not a color')).toBeNull();
    expect(parseOKLCH('')).toBeNull();
  });

  it('returns null for malformed OKLCH', () => {
    expect(parseOKLCH('oklch()')).toBeNull();
    expect(parseOKLCH('oklch(0.5)')).toBeNull();
  });
});

describe('formatOKLCH', () => {
  it('formats basic OKLCH color', () => {
    expect(formatOKLCH({ l: 0.205, c: 0.015, h: 265 })).toBe('oklch(0.205 0.015 265)');
  });

  it('formats OKLCH color with alpha', () => {
    expect(formatOKLCH({ l: 0.205, c: 0.015, h: 265, alpha: 0.8 })).toBe(
      'oklch(0.205 0.015 265 / 0.8)',
    );
  });

  it('rounds values appropriately', () => {
    expect(formatOKLCH({ l: 0.20500001, c: 0.01500001, h: 265.05 })).toBe(
      'oklch(0.205 0.015 265.1)',
    );
  });

  it('formats zero values', () => {
    expect(formatOKLCH({ l: 0, c: 0, h: 0 })).toBe('oklch(0 0 0)');
  });
});

describe('round-trip', () => {
  const testCases: OKLCHColor[] = [
    { l: 0.205, c: 0.015, h: 265 },
    { l: 0.985, c: 0, h: 0 },
    { l: 0.577, c: 0.245, h: 27.3 },
    { l: 0, c: 0, h: 0, alpha: 0.8 },
    { l: 1, c: 0, h: 0 },
  ];

  for (const original of testCases) {
    it(`round-trips ${formatOKLCH(original)}`, () => {
      const formatted = formatOKLCH(original);
      const parsed = parseOKLCH(formatted);
      expect(parsed).toEqual(original);
    });
  }
});
