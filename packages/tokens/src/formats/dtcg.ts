import type { DTCGToken, HareruTokens } from '../types';

/** DTCG composite token (e.g. typography) where $value is an object */
type DTCGCompositeToken = DTCGToken<Record<string, string>>;

interface DTCGGroup {
  [key: string]: DTCGToken | DTCGCompositeToken | DTCGGroup;
}

const TYPE_MAP: Record<string, DTCGToken['$type']> = {
  color: 'color',
  spacing: 'dimension',
  radius: 'dimension',
  'font.family': 'fontFamily',
  'font.size': 'dimension',
  'font.weight': 'fontWeight',
  'font.leading': 'number',
  'font.tracking': 'dimension',
  shadow: 'shadow',
  typography: 'typography',
  duration: 'duration',
  easing: 'cubicBezier',
  zIndex: 'number',
};

/**
 * Resolve the DTCG $type for a given token path.
 */
function resolveType(path: string): DTCGToken['$type'] {
  for (const [prefix, type] of Object.entries(TYPE_MAP)) {
    if (path === prefix || path.startsWith(`${prefix}.`)) {
      return type;
    }
  }
  return 'color';
}

/**
 * Convert a HareruTokens object to W3C Design Token Community Group (DTCG) format.
 */
export function toDTCG(tokens: HareruTokens): DTCGGroup {
  const result: DTCGGroup = {};

  function walk(obj: Record<string, unknown>, target: DTCGGroup, path: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string') {
        target[key] = {
          $type: resolveType(currentPath),
          $value: value,
        };
      } else if (typeof value === 'object' && value !== null) {
        if (path === 'typography') {
          target[key] = {
            $type: 'typography',
            $value: value as Record<string, string>,
          };
        } else {
          const group: DTCGGroup = {};
          walk(value as Record<string, unknown>, group, currentPath);
          target[key] = group;
        }
      }
    }
  }

  walk(tokens as unknown as Record<string, unknown>, result, '');
  return result;
}
