import { flattenTokens, generateThemeCSS, toCSS } from './formats/css';
import { toDTCG } from './formats/dtcg';
import {
  type PencilDocumentPayload,
  type PencilGetVariable,
  type PencilVariableSet,
  type ToPencilOptions,
  fromPencilGetVariables,
  fromPencilVariables,
  pencilBindings,
  toPencilDocument,
  toPencilVariables,
} from './formats/pencil';
import { type JSONSchema, toJSONSchema } from './formats/schema';
import type { HareruTheme, HareruTokens } from './types';

type DTCGGroup = ReturnType<typeof toDTCG>;

// biome-ignore lint/complexity/noStaticOnlyClass: namespace-style API for public consumption
export class TokenGenerator {
  /** Generate CSS Custom Properties from token set */
  static toCSS(tokens: HareruTokens, selector?: string): string {
    return toCSS(tokens, selector);
  }

  /** Generate DTCG standard JSON from token set */
  static toDTCG(tokens: HareruTokens): DTCGGroup {
    return toDTCG(tokens);
  }

  /** Generate theme CSS with :root (light) + [data-theme="dark"] override */
  static generateThemeCSS(theme: HareruTheme): string {
    return generateThemeCSS(theme.light, theme.dark);
  }

  /** Flatten nested tokens into CSS variable name-value pairs */
  static flattenTokens(tokens: Record<string, unknown>, prefix?: string) {
    return flattenTokens(tokens, prefix);
  }

  /** Convert HareruTheme to Pencil variable set */
  static toPencilVariables(theme: HareruTheme, options?: ToPencilOptions): PencilVariableSet {
    return toPencilVariables(theme, options);
  }

  /** Convert Pencil variables back to partial HareruTokens */
  static fromPencilVariables(
    pencilVars: PencilVariableSet,
    prefix?: string,
  ): Partial<HareruTokens> {
    return fromPencilVariables(pencilVars, prefix);
  }

  /** Convert HareruTheme to Pencil `set_variables` payload (hex colors, theme axes) */
  static toPencilDocument(theme: HareruTheme, options?: ToPencilOptions): PencilDocumentPayload {
    return toPencilDocument(theme, options);
  }

  /** Convert Pencil `get_variables` response back to partial HareruTokens */
  static fromPencilGetVariables(
    response: Record<string, PencilGetVariable>,
    prefix?: string,
  ): Partial<HareruTokens> {
    return fromPencilGetVariables(response, prefix);
  }

  /** Generate variable binding map (`$name` strings) for Pencil `batch_design` */
  static pencilBindings(theme: HareruTheme, options?: ToPencilOptions): Record<string, string> {
    return pencilBindings(theme, options);
  }

  /** Generate JSON Schema describing token structure, CSS variable names, and type constraints */
  static toJSONSchema(theme: HareruTheme): JSONSchema {
    return toJSONSchema(theme);
  }
}
