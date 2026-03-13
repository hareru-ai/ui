import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const SRC_DIR = join(PKG_ROOT, 'src');
const COMPONENTS_DIR = join(SRC_DIR, 'components');
const INDEX_FILE = join(SRC_DIR, 'index.ts');
const OUT_FILE = join(PKG_ROOT, 'dist', 'component-registry.json');

/**
 * Collect all regex matches as an array.
 */
function matchAll(regex, str) {
  return Array.from(str.matchAll(regex));
}

/**
 * Find the balanced brace block starting at the given index.
 * Skips string literals (single/double-quoted) to avoid counting braces inside strings.
 * Returns { content, end } or null if unbalanced.
 */
function extractBraceBlock(str, startIndex) {
  if (str[startIndex] !== '{') return null;
  let depth = 1;
  let i = startIndex + 1;
  while (i < str.length && depth > 0) {
    const ch = str[i];
    if (ch === "'" || ch === '"') {
      i++;
      while (i < str.length && str[i] !== ch) {
        if (str[i] === '\\') i++;
        i++;
      }
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
    }
    i++;
  }
  if (depth !== 0) return null;
  return { content: str.slice(startIndex + 1, i - 1), end: i };
}

/**
 * Parse cva() variants and defaultVariants from component source.
 *
 * Uses brace-counting to correctly handle nested {} in variant definitions.
 * Supports single-quoted base class strings.
 */
function parseCVA(source) {
  const cvaBlocks = [];
  const startRegex = /const\s+(\w+Variants)\s*=\s*cva\s*\(\s*'[^']*'\s*,\s*/g;

  for (const startMatch of matchAll(startRegex, source)) {
    const variantName = startMatch[1];
    const configStart = startMatch.index + startMatch[0].length;

    // Extract the full config object { variants: ..., defaultVariants: ... }
    const block = extractBraceBlock(source, configStart);
    if (!block) continue;

    const body = block.content;
    const variants = {};
    const defaultVariants = {};

    // Find "variants:" and extract its brace block
    const variantsKeyMatch = body.match(/variants\s*:\s*/);
    if (variantsKeyMatch) {
      const variantsStart = variantsKeyMatch.index + variantsKeyMatch[0].length;
      const variantsBlock = extractBraceBlock(body, variantsStart);
      if (variantsBlock) {
        // Parse each category (e.g. variant: { ... }, size: { ... })
        const categoryStartRegex = /(\w+)\s*:\s*(?=\{)/g;
        for (const catMatch of matchAll(categoryStartRegex, variantsBlock.content)) {
          const category = catMatch[1];
          const catBraceStart = catMatch.index + catMatch[0].length;
          const catBlock = extractBraceBlock(variantsBlock.content, catBraceStart);
          if (catBlock) {
            const options = [];
            const keyRegex = /['"]?(\w[\w-]*)['"]?\s*:/g;
            for (const keyMatch of matchAll(keyRegex, catBlock.content)) {
              options.push(keyMatch[1]);
            }
            variants[category] = options;
          }
        }
      }
    }

    // Parse defaultVariants block (flat object, no nested braces)
    const defaultKeyMatch = body.match(/defaultVariants\s*:\s*\{([^}]*)\}/);
    if (defaultKeyMatch) {
      const defRegex = /(\w+)\s*:\s*['"](\w+)['"]/g;
      for (const defMatch of matchAll(defRegex, defaultKeyMatch[1])) {
        defaultVariants[defMatch[1]] = defMatch[2];
      }
    }

    cvaBlocks.push({ name: variantName, variants, defaultVariants });
  }

  return cvaBlocks;
}

/**
 * Parse exported Props interfaces from component source.
 *
 * Does not handle nested object types in Props body (e.g. `{ id: string }`).
 * customProps should be treated as informational.
 */
function parseProps(source) {
  const props = [];
  const propsRegex = /export\s+interface\s+(\w+Props)\s+(?:extends\s+([^{]+))?\{([^}]*)\}/g;

  for (const match of matchAll(propsRegex, source)) {
    const name = match[1];
    const extendsClause = match[2]?.trim() || null;
    const body = match[3].trim();

    const customProps = [];
    if (body) {
      const propRegex = /(\w+)\??\s*:\s*([^;]+)/g;
      for (const propMatch of matchAll(propRegex, body)) {
        customProps.push({
          name: propMatch[1],
          type: propMatch[2].trim(),
          required: !body.includes(`${propMatch[1]}?`),
        });
      }
    }

    props.push({ name, extends: extendsClause, customProps });
  }

  return props;
}

/**
 * Parse displayName assignments from source.
 */
function parseDisplayNames(source) {
  const names = [];
  const regex = /(\w+)\.displayName\s*=\s*['"](\w+)['"]/g;
  for (const match of matchAll(regex, source)) {
    names.push(match[2]);
  }
  return names;
}

/**
 * Parse index.ts to build export groups per component directory.
 */
function parseIndexExports(indexSource) {
  const groups = {};
  const exportRegex = /export\s*\{([^}]+)\}\s*from\s*'\.\/components\/(\w+)'/g;

  for (const match of matchAll(exportRegex, indexSource)) {
    const exports = match[1]
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e && !e.startsWith('type '));
    const dir = match[2];

    if (!groups[dir]) {
      groups[dir] = [];
    }
    groups[dir].push(...exports);
  }

  return groups;
}

// --- Main ---
const indexSource = readFileSync(INDEX_FILE, 'utf-8');
const exportGroups = parseIndexExports(indexSource);

const componentDirs = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const components = [];

for (const dir of componentDirs) {
  const dirPath = join(COMPONENTS_DIR, dir);
  const mainFile = join(dirPath, `${dir}.tsx`);

  let source;
  try {
    source = readFileSync(mainFile, 'utf-8');
  } catch {
    continue;
  }

  const cvaVariants = parseCVA(source);
  const propsInterfaces = parseProps(source);
  const displayNames = parseDisplayNames(source);
  const exports = exportGroups[dir] || displayNames;

  // Subcomponents: PascalCase exports that are not the main component or variant exports
  const subcomponents = exports.filter(
    (e) => /^[A-Z]/.test(e) && !e.endsWith('Variants') && e !== dir,
  );

  const entry = {
    name: dir,
    displayName: displayNames[0] || dir,
    subcomponents: subcomponents.length > 0 ? subcomponents : undefined,
    variants:
      cvaVariants.length > 0
        ? cvaVariants.map((v) => ({
            name: v.name,
            variants: v.variants,
            defaultVariants: v.defaultVariants,
          }))
        : undefined,
    props:
      propsInterfaces.length > 0
        ? propsInterfaces.map((p) => ({
            name: p.name,
            extends: p.extends,
            customProps: p.customProps.length > 0 ? p.customProps : undefined,
          }))
        : undefined,
  };

  components.push(entry);
}

const registry = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  name: '@hareru/ui',
  version: JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf-8')).version,
  componentCount: components.length,
  components,
};

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(registry, null, 2), 'utf-8');
console.log(`Generated dist/component-registry.json (${components.length} components)`);
