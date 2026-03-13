import type { HareruTokens, TypographyToken } from '../types';

type FlatTokenMap = Map<string, string>;

/** Convert camelCase key to kebab-case (e.g. fontSize → font-size, zIndex → z-index) */
function toKebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * Flatten nested token object into CSS variable name-value pairs.
 * DEFAULT keys are collapsed into the parent name.
 *
 * Example:
 *   color.primary.DEFAULT → --hui-color-primary
 *   color.primary.foreground → --hui-color-primary-foreground
 *   shadow.DEFAULT → --hui-shadow
 */
export function flattenTokens(tokens: Record<string, unknown>, prefix = '--hui'): FlatTokenMap {
  const result: FlatTokenMap = new Map();

  function walk(obj: Record<string, unknown>, path: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const kebabKey = toKebab(key);
      const nextPath = key === 'DEFAULT' ? path : `${path}-${kebabKey}`;

      if (typeof value === 'string') {
        result.set(nextPath, value);
      } else if (typeof value === 'object' && value !== null) {
        walk(value as Record<string, unknown>, nextPath);
      }
    }
  }

  walk(tokens as Record<string, unknown>, prefix);
  return result;
}

/**
 * Map TypographyToken property names to CSS property names.
 */
const TYPOGRAPHY_CSS_PROPS: Record<keyof TypographyToken, string> = {
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
};

/**
 * Generate typography utility CSS classes from typography tokens.
 * Example: `.hui-typography-h1 { font-size: var(--hui-typography-h1-font-size); ... }`
 */
function generateTypographyClasses(
  typography: Record<string, TypographyToken>,
  prefix = '--hui',
): string {
  const blocks: string[] = [];

  for (const name of Object.keys(typography)) {
    const token = typography[name];
    const className = `.hui-typography-${name}`;
    const varPrefix = `${prefix}-typography-${name}`;
    const declarations: string[] = [];

    for (const [prop, cssProp] of Object.entries(TYPOGRAPHY_CSS_PROPS)) {
      if (token[prop as keyof TypographyToken] !== undefined) {
        declarations.push(`  ${cssProp}: var(${varPrefix}-${toKebab(prop)});`);
      }
    }

    blocks.push(`${className} {\n${declarations.join('\n')}\n}`);
  }

  return blocks.join('\n\n');
}

/**
 * Generate CSS Custom Properties block from a token set.
 */
export function toCSS(tokens: HareruTokens, selector = ':root'): string {
  const flat = flattenTokens(tokens as unknown as Record<string, unknown>);
  const lines: string[] = [];

  for (const [name, value] of flat) {
    lines.push(`  ${name}: ${value};`);
  }

  return `${selector} {\n${lines.join('\n')}\n}`;
}

/**
 * Generate full theme CSS with :root (light) + [data-theme="dark"] override.
 * Dark block only includes tokens that differ from light.
 */
export function generateThemeCSS(light: HareruTokens, dark: HareruTokens): string {
  const lightCSS = toCSS(light, ':root');

  const lightFlat = flattenTokens(light as unknown as Record<string, unknown>);
  const darkFlat = flattenTokens(dark as unknown as Record<string, unknown>);

  const darkOverrides: string[] = [];
  for (const [name, value] of darkFlat) {
    if (lightFlat.get(name) !== value) {
      darkOverrides.push(`  ${name}: ${value};`);
    }
  }

  const darkCSS = `[data-theme="dark"] {\n${darkOverrides.join('\n')}\n}`;

  const typographyCSS = generateTypographyClasses(light.typography);

  return `${lightCSS}\n\n${darkCSS}\n\n${typographyCSS}\n`;
}
