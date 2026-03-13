/** OKLCH color representation */
export interface OKLCHColor {
  /** Lightness 0-1 */
  l: number;
  /** Chroma 0-0.4+ */
  c: number;
  /** Hue 0-360 */
  h: number;
  /** Alpha 0-1 (optional) */
  alpha?: number;
}

const OKLCH_RE = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)$/;

/**
 * Parse an OKLCH color string into its components.
 *
 * Supports:
 * - `oklch(0.205 0.015 265)`
 * - `oklch(0.205 0.015 265 / 0.8)`
 * - `oklch(50% 0.015 265)` (percentage lightness)
 *
 * Returns `null` for non-OKLCH strings.
 *
 * Note: CSS `none` keyword and scientific notation (e.g., `1e-4`) are not supported.
 */
export function parseOKLCH(color: string): OKLCHColor | null {
  const match = color.match(OKLCH_RE);
  if (!match) return null;

  const rawL = match[1];
  const l = rawL.endsWith('%') ? Number.parseFloat(rawL) / 100 : Number(rawL);
  const c = Number(match[2]);
  const h = Number(match[3]);
  const alpha = match[4] !== undefined ? Number(match[4]) : undefined;

  if (Number.isNaN(l) || Number.isNaN(c) || Number.isNaN(h)) return null;
  if (alpha !== undefined && Number.isNaN(alpha)) return null;

  return { l, c, h, ...(alpha !== undefined && { alpha }) };
}

/**
 * Format an OKLCHColor object back to a CSS string.
 *
 * - `{ l: 0.205, c: 0.015, h: 265 }` → `'oklch(0.205 0.015 265)'`
 * - `{ l: 0.205, c: 0.015, h: 265, alpha: 0.8 }` → `'oklch(0.205 0.015 265 / 0.8)'`
 */
export function formatOKLCH(color: OKLCHColor): string {
  const l = round(color.l, 4);
  const c = round(color.c, 4);
  const h = round(color.h, 1);
  if (color.alpha !== undefined) {
    return `oklch(${l} ${c} ${h} / ${round(color.alpha, 2)})`;
  }
  return `oklch(${l} ${c} ${h})`;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
