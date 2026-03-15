import type { HareruTheme } from '../types';
import { flattenTokens } from './css';
import { toDTCG } from './dtcg';

type JSONSchemaType = 'string' | 'number' | 'object' | 'array' | 'boolean' | 'null';

interface JSONSchemaProperty {
  type: JSONSchemaType;
  pattern?: string;
  enum?: string[];
  description?: string;
}

export interface JSONSchema {
  $schema: string;
  title: string;
  description: string;
  type: string;
  properties: Record<string, unknown>;
  additionalProperties: boolean;
}

/** Regex patterns for DTCG $type validation */
const TYPE_PATTERNS: Record<
  string,
  { type: JSONSchemaType; pattern?: string; description: string }
> = {
  color: {
    type: 'string',
    pattern: '^oklch\\([\\d.]+ [\\d.]+ [\\d.]+(\\s*/\\s*[\\d.]+%?)?\\)$',
    description: 'OKLCH color value',
  },
  dimension: {
    type: 'string',
    pattern: '^-?[\\d.]+(rem|px|em|%)$',
    description: 'CSS dimension value',
  },
  fontFamily: {
    type: 'string',
    description: 'CSS font-family value',
  },
  fontWeight: {
    type: 'string',
    pattern: '^[\\d]+$',
    description: 'CSS font-weight value',
  },
  duration: {
    type: 'string',
    pattern: '^[\\d.]+(ms|s)$',
    description: 'CSS duration value',
  },
  number: {
    type: 'string',
    pattern: '^-?[\\d.]+$',
    description: 'Numeric value',
  },
  shadow: {
    type: 'string',
    description: 'CSS box-shadow value',
  },
  typography: {
    type: 'object',
    description: 'Typography composite token',
  },
  cubicBezier: {
    type: 'string',
    pattern: '^cubic-bezier\\([\\d., -]+\\)$',
    description: 'CSS cubic-bezier timing function',
  },
};

/**
 * Collect all DTCG $type values from the token tree.
 *
 * Input is the output of toDTCG() (DTCG-transformed object).
 * Leaf nodes are objects with { $type, $value }, unlike flattenTokens()
 * which treats string values as leaves.
 */
function collectTypes(
  obj: Record<string, unknown>,
  result: Map<string, string> = new Map(),
  path = '',
): Map<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === 'object' && value !== null && '$type' in value && '$value' in value) {
      const token = value as { $type: string; $value: unknown };
      result.set(currentPath, token.$type);
    } else if (typeof value === 'object' && value !== null) {
      collectTypes(value as Record<string, unknown>, result, currentPath);
    }
  }
  return result;
}

/**
 * Generate a JSON Schema from a HareruTheme.
 *
 * The schema includes:
 * - CSS variable name enum (all `--hui-*` variables)
 * - Token path enum (all dot-notation paths)
 * - Type constraints per DTCG $type
 */
export function toJSONSchema(theme: HareruTheme): JSONSchema {
  const lightDTCG = toDTCG(theme.light);
  const lightFlat = flattenTokens(theme.light as unknown as Record<string, unknown>);

  // Collect CSS variable names
  const cssVariables = Array.from(lightFlat.keys()).sort();

  // Collect token paths and their types
  const tokenTypes = collectTypes(lightDTCG as unknown as Record<string, unknown>);
  const tokenPaths = Array.from(tokenTypes.keys()).sort();

  // Build type constraint map
  const typeConstraints: Record<string, JSONSchemaProperty> = {};
  for (const [typeName, config] of Object.entries(TYPE_PATTERNS)) {
    const constraint: JSONSchemaProperty = {
      type: config.type,
      description: config.description,
    };
    if (config.pattern) {
      constraint.pattern = config.pattern;
    }
    typeConstraints[typeName] = constraint;
  }

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Hareru UI Design Tokens',
    description:
      'Machine-readable schema for Hareru UI design tokens. Use cssVariables for CSS custom property names, tokenPaths for DTCG dot-notation paths.',
    type: 'object',
    properties: {
      cssVariables: {
        type: 'array',
        description: 'All available CSS custom property names (--hui-* prefix)',
        items: {
          type: 'string',
          enum: cssVariables,
        },
      },
      tokenPaths: {
        type: 'array',
        description: 'All DTCG token paths in dot notation (e.g. color.primary.DEFAULT)',
        items: {
          type: 'string',
          enum: tokenPaths,
        },
      },
      typeConstraints: {
        type: 'object',
        description: 'Validation constraints per DTCG $type (color, dimension, etc.)',
        properties: typeConstraints,
        additionalProperties: false,
      },
      tokenCount: {
        type: 'number',
        const: cssVariables.length,
        description: 'Total number of CSS custom properties',
      },
    },
    additionalProperties: false,
  };
}
