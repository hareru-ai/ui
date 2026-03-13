import { formatOKLCH, parseOKLCH } from './oklch';
import type { HareruTokens } from './types';

export interface DarkThemeOptions {
  /** Lightness inversion strength (default: 1.0 = full inversion) */
  lightnessInversion?: number;
  /** Chroma scale factor for dark colors (default: 0.85) */
  chromaScale?: number;
  /** Shadow opacity multiplier (default: 4.0) */
  shadowOpacityMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<DarkThemeOptions> = {
  lightnessInversion: 1.0,
  chromaScale: 0.85,
  shadowOpacityMultiplier: 4.0,
};

/**
 * Generate a dark theme from a light theme automatically.
 *
 * Processing:
 * 1. color: Invert OKLCH Lightness (L → 1-L) + Chroma adjustment
 * 2. shadow: Increase opacity (dark backgrounds need stronger shadows)
 * 3. spacing, radius, font, typography, duration, easing, zIndex: Unchanged
 */
export function generateDarkTokens(
  lightTokens: HareruTokens,
  options?: DarkThemeOptions,
): HareruTokens {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return {
    color: invertColors(lightTokens.color, opts),
    spacing: lightTokens.spacing,
    radius: lightTokens.radius,
    font: lightTokens.font,
    typography: lightTokens.typography,
    shadow: invertShadows(lightTokens.shadow, opts.shadowOpacityMultiplier),
    duration: lightTokens.duration,
    easing: lightTokens.easing,
    zIndex: lightTokens.zIndex,
  };
}

/**
 * Invert a single OKLCH color string for dark theme.
 * Non-OKLCH strings (e.g., overlay with rgb) are returned unchanged.
 */
function invertColor(colorStr: string, opts: Required<DarkThemeOptions>): string {
  const parsed = parseOKLCH(colorStr);
  if (!parsed) return colorStr;

  // Special case: colors with alpha (e.g., overlay) — don't change
  if (parsed.alpha !== undefined) return colorStr;

  // Invert lightness: lerp(L, 1-L, strength)
  const invertedL = parsed.l + (1 - 2 * parsed.l) * opts.lightnessInversion;
  const newL = Math.max(0, Math.min(1, invertedL));

  // Adjust chroma based on original lightness
  let chromaFactor: number;
  if (parsed.l >= 0.8) {
    chromaFactor = 0.7;
  } else if (parsed.l > 0.4) {
    chromaFactor = opts.chromaScale;
  } else {
    chromaFactor = 1.0;
  }
  const newC = parsed.c * chromaFactor;

  return formatOKLCH({ l: newL, c: newC, h: parsed.h });
}

/**
 * Recursively invert all color values in the color token object.
 */
function invertColors(
  colors: HareruTokens['color'],
  opts: Required<DarkThemeOptions>,
): HareruTokens['color'] {
  return deepMapStrings(colors, (value) => invertColor(value, opts)) as HareruTokens['color'];
}

/**
 * Adjust shadow opacity for dark theme.
 * Multiplies rgb alpha values by the given multiplier, clamped to 1.
 */
function invertShadows(
  shadows: Record<string, string>,
  multiplier: number,
): Record<string, string> {
  const result: Record<string, string> = {};
  const opacityRe = /rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)/g;

  for (const [key, value] of Object.entries(shadows)) {
    result[key] = value.replace(opacityRe, (_match, r, g, b, alpha) => {
      const newAlpha = Math.min(1, Number(alpha) * multiplier);
      const rounded = Math.round(newAlpha * 100) / 100;
      return `rgb(${r} ${g} ${b} / ${rounded})`;
    });
  }

  return result;
}

/**
 * Recursively map all string values in an object.
 */
function deepMapStrings(
  obj: Record<string, unknown>,
  fn: (value: string) => string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = fn(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = deepMapStrings(value as Record<string, unknown>, fn);
    } else {
      result[key] = value;
    }
  }
  return result;
}
