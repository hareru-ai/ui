import type { HareruTheme, HareruTokens } from '../types';
import { flattenTokens } from './css';

// ---------------------------------------------------------------------------
// Internal representation (backward-compatible)
// ---------------------------------------------------------------------------

export interface PencilVariable {
  value: string;
  themes?: Record<string, string>;
}

export interface PencilVariableSet {
  [name: string]: PencilVariable;
}

export interface ToPencilOptions {
  prefix?: string;
  includeThemes?: boolean;
  categories?: Array<
    | 'color'
    | 'spacing'
    | 'radius'
    | 'font'
    | 'typography'
    | 'shadow'
    | 'duration'
    | 'easing'
    | 'zIndex'
  >;
}

// ---------------------------------------------------------------------------
// Pencil MCP native types
// ---------------------------------------------------------------------------

/** Single value entry in a Pencil variable's value array */
export interface PencilDocValueEntry {
  value: string | number;
  theme?: Record<string, string>;
}

/** Variable format accepted by Pencil `set_variables` */
export interface PencilDocVariable {
  type: 'color' | 'number' | 'string';
  value: string | number | PencilDocValueEntry[];
}

/** Variable format returned by Pencil `get_variables` */
export interface PencilGetVariable {
  name?: string;
  type: 'color' | 'number' | 'string';
  /** `get_variables` returns `values` (plural array) */
  values: PencilDocValueEntry[];
}

/** Full document payload for Pencil `set_variables` */
export interface PencilDocumentPayload {
  themes: Record<string, string[]>;
  variables: Record<string, PencilDocVariable>;
}

// ---------------------------------------------------------------------------
// Color → Hex conversion (HSL + OKLCH)
// ---------------------------------------------------------------------------

const HSL_RE = /hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*(?:\/\s*([\d.]+))?\s*\)/;
const OKLCH_RE = /oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)/;

/**
 * Convert an HSL string to hex color.
 * @deprecated Use `colorToHex` instead, which also supports OKLCH.
 */
export function hslToHex(hsl: string): string {
  return colorToHex(hsl);
}

/**
 * Convert an HSL or OKLCH color string to hex.
 * Supports:
 * - `hsl(H S% L%)` / `hsl(H S% L% / A)` (CSS Color Level 4)
 * - `oklch(L C H)` / `oklch(L C H / A)`
 * Returns `#RRGGBB` or `#RRGGBBAA` when alpha < 1.
 */
export function colorToHex(color: string): string {
  const hslMatch = color.match(HSL_RE);
  if (hslMatch) {
    return hslToRgbHex(hslMatch);
  }

  const oklchMatch = color.match(OKLCH_RE);
  if (oklchMatch) {
    return oklchToRgbHex(oklchMatch);
  }

  throw new Error(`Invalid color string: ${color}`);
}

/** HSL regex match → hex */
function hslToRgbHex(match: RegExpMatchArray): string {
  const h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;
  const a = match[4] !== undefined ? Number(match[4]) : 1;

  const hueToRgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return rgbToHex(r, g, b, a);
}

/** OKLCH regex match → hex (via OKLab → linear sRGB → sRGB) */
function oklchToRgbHex(match: RegExpMatchArray): string {
  const rawL = match[1];
  const L = rawL.endsWith('%') ? Number.parseFloat(rawL) / 100 : Number(rawL);
  const C = Number(match[2]);
  const H = Number(match[3]);
  const a = match[4] !== undefined ? Number(match[4]) : 1;

  // OKLCH → OKLab
  const hRad = (H * Math.PI) / 180;
  const labA = C * Math.cos(hRad);
  const labB = C * Math.sin(hRad);

  // OKLab → linear sRGB (Björn Ottosson)
  // Source: https://bottosson.github.io/posts/oklab/
  const l_ = L + 0.3963377774 * labA + 0.2158037573 * labB;
  const m_ = L - 0.1055613458 * labA - 0.0638541728 * labB;
  const s_ = L - 0.0894841775 * labA - 1.291485548 * labB;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const lr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  // Linear sRGB → sRGB (gamma)
  const gamma = (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  };

  return rgbToHex(gamma(lr), gamma(lg), gamma(lb), a);
}

/** Convert linear [0,1] RGB + alpha to hex string */
function rgbToHex(r: number, g: number, b: number, a: number): string {
  const toHexByte = (n: number): string =>
    Math.round(Math.min(1, Math.max(0, n)) * 255)
      .toString(16)
      .padStart(2, '0');

  const hex = `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;

  if (a < 1) {
    return `${hex}${toHexByte(a)}`;
  }
  return hex;
}

// ---------------------------------------------------------------------------
// CSS unit → number conversion
// ---------------------------------------------------------------------------

const REM_BASE = 16;

/**
 * Convert a CSS dimension string to a plain number (px).
 * - `"16px"` → `16`
 * - `"1rem"` → `16`
 * - `"0.25rem"` → `4`
 * - plain number string `"400"` → `400`
 */
function cssToNumber(value: string): number {
  if (value.endsWith('px')) {
    return Number.parseFloat(value);
  }
  if (value.endsWith('rem')) {
    return Number.parseFloat(value) * REM_BASE;
  }
  // Plain numeric strings (font weights, line heights, etc.)
  return Number.parseFloat(value);
}

// ---------------------------------------------------------------------------
// Category extraction & type mapping
// ---------------------------------------------------------------------------

/**
 * Extract the token category from a variable name (without prefix).
 * Handles compound categories like `z-index` where `split('-')[0]` alone
 * would incorrectly yield `z`.
 */
function extractCategory(withoutPrefix: string): string {
  if (withoutPrefix.startsWith('z-index')) return 'z-index';
  return withoutPrefix.split('-')[0];
}

/** Map camelCase category names (ToPencilOptions) to kebab-case (CSS variable names). */
function categoryToKebab(cat: string): string {
  return cat.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function pencilType(category: string): 'color' | 'number' | 'string' {
  if (category === 'color') return 'color';
  if (category === 'spacing' || category === 'radius' || category === 'z-index') return 'number';
  return 'string';
}

// ---------------------------------------------------------------------------
// toPencilDocument — Pencil `set_variables` format
// ---------------------------------------------------------------------------

/**
 * Convert HareruTheme to Pencil `set_variables` payload.
 *
 * - Colors are auto-converted from HSL to hex.
 * - spacing/radius values are converted from CSS units to numbers.
 * - When light and dark values differ, the variable uses the array form
 *   with theme conditions; otherwise a single value is used.
 */
export function toPencilDocument(
  theme: HareruTheme,
  options: ToPencilOptions = {},
): PencilDocumentPayload {
  const { prefix = 'hui', includeThemes = true, categories } = options;

  const lightFlat = flattenTokens(theme.light as unknown as Record<string, unknown>, prefix);
  const darkFlat = flattenTokens(theme.dark as unknown as Record<string, unknown>, prefix);

  const variables: Record<string, PencilDocVariable> = {};

  const kebabCategories = categories?.map(categoryToKebab);

  for (const [name, lightValue] of lightFlat) {
    const withoutPrefix = name.slice(prefix.length + 1);
    const category = extractCategory(withoutPrefix);

    if (kebabCategories) {
      if (!kebabCategories.includes(category)) {
        continue;
      }
    }

    const type = pencilType(category);
    const lightConverted = type === 'color' ? colorToHex(lightValue) : lightValue;

    if (includeThemes) {
      const darkValue = darkFlat.get(name);
      if (darkValue && darkValue !== lightValue) {
        const darkConverted = type === 'color' ? colorToHex(darkValue) : darkValue;

        const lightEntry: PencilDocValueEntry = {
          value: type === 'number' ? cssToNumber(lightConverted) : lightConverted,
        };
        const darkEntry: PencilDocValueEntry = {
          value: type === 'number' ? cssToNumber(darkConverted as string) : darkConverted,
          theme: { mode: 'dark' },
        };

        variables[name] = { type, value: [lightEntry, darkEntry] };
        continue;
      }
    }

    // Single value (no theme difference or themes disabled)
    const finalValue = type === 'number' ? cssToNumber(lightConverted) : lightConverted;
    variables[name] = { type, value: finalValue };
  }

  return {
    themes: { mode: ['light', 'dark'] },
    variables,
  };
}

// ---------------------------------------------------------------------------
// fromPencilGetVariables — Pencil `get_variables` response → tokens
// ---------------------------------------------------------------------------

/**
 * Convert Pencil `get_variables` response back to partial HareruTokens.
 * The response uses `values` (plural array) — takes the first (default/light) entry.
 */
export function fromPencilGetVariables(
  response: Record<string, PencilGetVariable>,
  prefix = 'hui',
): Partial<HareruTokens> {
  const result: Record<string, unknown> = {};

  const entries = Object.entries(response).sort(([a], [b]) => a.length - b.length);

  for (const [name, variable] of entries) {
    if (!name.startsWith(`${prefix}-`)) continue;

    const withoutPrefix = name.slice(prefix.length + 1);
    const parts = withoutPrefix.split('-');

    // `values` is always an array; take the first entry (default/light theme)
    const rawValue = variable.values[0]?.value ?? '';

    setNestedValue(result, parts, String(rawValue));
  }

  return result as Partial<HareruTokens>;
}

// ---------------------------------------------------------------------------
// Pencil binding helpers — `batch_design` "$name" syntax
// ---------------------------------------------------------------------------

/**
 * Return the Pencil variable binding string for use in `batch_design`.
 * Example: `pencilBinding('hui-color-primary')` → `"$hui-color-primary"`
 */
export function pencilBinding(name: string): string {
  return `$${name}`;
}

/**
 * Generate a full map of variable names → binding strings for `batch_design`.
 * Example output: `{ "hui-color-primary": "$hui-color-primary", ... }`
 */
export function pencilBindings(
  theme: HareruTheme,
  options: ToPencilOptions = {},
): Record<string, string> {
  const { prefix = 'hui', categories } = options;

  const lightFlat = flattenTokens(theme.light as unknown as Record<string, unknown>, prefix);
  const bindings: Record<string, string> = {};

  const kebabCats = categories?.map(categoryToKebab);

  for (const [name] of lightFlat) {
    if (kebabCats) {
      const withoutPrefix = name.slice(prefix.length + 1);
      const category = extractCategory(withoutPrefix);
      if (!kebabCats.includes(category)) {
        continue;
      }
    }

    bindings[name] = pencilBinding(name);
  }

  return bindings;
}

// ---------------------------------------------------------------------------
// Existing functions (backward-compatible)
// ---------------------------------------------------------------------------

/**
 * Convert HareruTheme to Pencil variable set.
 * Uses flattenTokens from css.ts to generate flat name-value pairs.
 *
 * Variable naming:
 *   color.primary.DEFAULT   → hui-color-primary
 *   color.primary.foreground→ hui-color-primary-foreground
 *   spacing.4               → hui-spacing-4
 *   shadow.DEFAULT          → hui-shadow
 */
export function toPencilVariables(
  theme: HareruTheme,
  options: ToPencilOptions = {},
): PencilVariableSet {
  const { prefix = 'hui', includeThemes = true, categories } = options;

  const lightFlat = flattenTokens(theme.light as unknown as Record<string, unknown>, prefix);
  const darkFlat = flattenTokens(theme.dark as unknown as Record<string, unknown>, prefix);

  const result: PencilVariableSet = {};

  for (const [name, lightValue] of lightFlat) {
    // Category filter
    if (categories) {
      const withoutPrefix = name.slice(prefix.length + 1);
      const category = extractCategory(withoutPrefix);
      const kebabCats = categories.map(categoryToKebab);
      if (!kebabCats.includes(category)) {
        continue;
      }
    }

    const variable: PencilVariable = { value: lightValue };

    if (includeThemes) {
      const darkValue = darkFlat.get(name);
      if (darkValue && darkValue !== lightValue) {
        variable.themes = { dark: darkValue };
      }
    }

    result[name] = variable;
  }

  return result;
}

/**
 * Convert Pencil variables back to partial HareruTokens.
 * Reverse of toPencilVariables — reconstructs nested structure from flat names.
 */
export function fromPencilVariables(
  pencilVars: PencilVariableSet,
  prefix = 'hui',
): Partial<HareruTokens> {
  const result: Record<string, unknown> = {};

  // Sort entries so shorter paths come first, then process children
  const entries = Object.entries(pencilVars).sort(([a], [b]) => a.length - b.length);

  for (const [name, variable] of entries) {
    const withoutPrefix = name.slice(prefix.length + 1);
    const parts = withoutPrefix.split('-');
    setNestedValue(result, parts, variable.value);
  }

  return result as Partial<HareruTokens>;
}

function setNestedValue(obj: Record<string, unknown>, parts: string[], value: string): void {
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof current[key] === 'string') {
      // Was a plain value, now has children — convert to DEFAULT
      const existingValue = current[key] as string;
      current[key] = { DEFAULT: existingValue };
    } else if (!(key in current)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = parts[parts.length - 1];
  if (typeof current[lastKey] === 'object' && current[lastKey] !== null) {
    // Already has children, set as DEFAULT
    (current[lastKey] as Record<string, unknown>).DEFAULT = value;
  } else {
    current[lastKey] = value;
  }
}
