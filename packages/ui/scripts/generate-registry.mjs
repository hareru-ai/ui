import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const SRC_DIR = join(PKG_ROOT, 'src');
const COMPONENTS_DIR = join(SRC_DIR, 'components');
const INDEX_FILE = join(SRC_DIR, 'index.ts');
const OUT_FILE = join(PKG_ROOT, 'dist', 'component-registry.json');

// --- Taxonomy: component → group mapping ---
const TAXONOMY = {
  Alert: 'feedback',
  AlertDialog: 'overlay',
  ApprovalCard: 'agent',
  AspectRatio: 'layout',
  AsyncComboboxField: 'form',
  Avatar: 'data-display',
  Badge: 'feedback',
  BentoGrid: 'layout',
  Button: 'core',
  Card: 'layout',
  ChatComposer: 'agent',
  ChatContainer: 'agent',
  ChatMessage: 'agent',
  Collapsible: 'layout',
  Combobox: 'form',
  Command: 'overlay',
  ConfidenceBadge: 'data-display',
  DataQualityIndicator: 'data-display',
  DefinitionBrowser: 'di-domain',
  Dialog: 'overlay',
  DropdownMenu: 'overlay',
  EmptyState: 'feedback',
  FieldDiff: 'data-display',
  FormField: 'form',
  Input: 'core',
  KeyValueList: 'data-display',
  Label: 'core',
  MetricCard: 'di-domain',
  NavigationMenu: 'navigation',
  Popover: 'overlay',
  Progress: 'feedback',
  QueryFeedback: 'di-domain',
  ReadonlyField: 'data-display',
  ReasoningPanel: 'agent',
  ScrollArea: 'layout',
  Select: 'form',
  SemanticSuggest: 'di-domain',
  Separator: 'core',
  Sheet: 'overlay',
  Skeleton: 'layout',
  StreamingText: 'agent',
  Switch: 'core',
  Table: 'data-display',
  Tabs: 'navigation',
  Textarea: 'core',
  Toast: 'feedback',
  Toggle: 'core',
  ToolCallCard: 'agent',
  Tooltip: 'overlay',
};

// --- Token category detection ---
const TOKEN_CATEGORIES = [
  { category: 'color', prefix: '--hui-color-' },
  { category: 'spacing', prefix: '--hui-spacing-' },
  { category: 'radius', prefix: '--hui-radius-' },
  { category: 'font', prefix: '--hui-font-' },
  { category: 'typography', prefix: '--hui-typography-' },
  { category: 'shadow', prefix: '--hui-shadow' },
  { category: 'duration', prefix: '--hui-duration-' },
  { category: 'easing', prefix: '--hui-easing-' },
  { category: 'zIndex', prefix: '--hui-z-index-' },
];

// --- Component manifest (single source of truth) ---
const manifest = JSON.parse(readFileSync(join(__dirname, 'component-manifest.json'), 'utf-8'));

// --- Shared keyframes extraction from animations.css ---
const animationsCssPath = join(PKG_ROOT, 'src/styles/animations.css');
const animationsSrc = existsSync(animationsCssPath) ? readFileSync(animationsCssPath, 'utf-8') : '';
const sharedKeyframes = [...animationsSrc.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);

/**
 * Collect all regex matches as an array.
 */
function matchAll(regex, str) {
  return Array.from(str.matchAll(regex));
}

/**
 * Find the balanced brace block starting at the given index.
 * Skips string literals (single/double/backtick-quoted) to avoid counting braces inside strings.
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
    } else if (ch === '`') {
      i++;
      while (i < str.length && str[i] !== '`') {
        if (str[i] === '\\') {
          i += 2;
          continue;
        }
        // Skip ${...} interpolations inside template literals
        if (str[i] === '$' && str[i + 1] === '{') {
          i += 2;
          let innerDepth = 1;
          while (i < str.length && innerDepth > 0) {
            if (str[i] === '{') innerDepth++;
            else if (str[i] === '}') innerDepth--;
            i++;
          }
          continue;
        }
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
      const defRegex = /(\w+)\s*:\s*['"]([\w-]+)['"]/g;
      for (const defMatch of matchAll(defRegex, defaultKeyMatch[1])) {
        defaultVariants[defMatch[1]] = defMatch[2];
      }
    }

    cvaBlocks.push({ name: variantName, variants, defaultVariants });
  }

  return cvaBlocks;
}

/**
 * Split interface body into top-level member strings using brace-depth tracking.
 * Handles nested types like `Record<string, { id: string; label: string }>` correctly.
 * Handles arrow function types (`=>`) without mis-counting `>` as closing a generic.
 *
 * NOTE: This is a hand-written tokenizer, not a TypeScript parser.
 * Conditional types, mapped types, and other advanced type constructs may need
 * additional handling. Consider migrating to ts-morph if complexity grows.
 * Members are delimited by `;` or `,` at depth 0 (both valid TypeScript separators).
 */
function splitInterfaceMembers(body) {
  const members = [];
  let depth = 0; // tracks {}, <>, (), []
  let start = 0;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '{' || ch === '(' || ch === '[') {
      depth++;
    } else if (ch === '}' || ch === ')' || ch === ']') {
      depth--;
    } else if (ch === '<') {
      depth++;
    } else if (ch === '>') {
      // Skip `=>` (arrow function type) — the `>` here is not closing a generic
      if (i > 0 && body[i - 1] === '=') {
        // do not decrement depth
      } else {
        depth--;
      }
    } else if (ch === "'" || ch === '"' || ch === '`') {
      // Skip string/template literals
      i++;
      while (i < body.length && body[i] !== ch) {
        if (body[i] === '\\') i++;
        i++;
      }
    } else if (depth === 0 && (ch === ';' || ch === ',')) {
      const member = body.slice(start, i).trim();
      if (member) members.push(member);
      start = i + 1;
    }
  }
  // Last member (may lack trailing ; or ,)
  const last = body.slice(start).trim();
  if (last) members.push(last);

  return members;
}

/**
 * Parse exported Props interfaces from component source.
 *
 * Uses extractBraceBlock() to handle nested types (e.g. `Record<string, { id: string }>`).
 * Strips JSDoc and line comments before extracting properties.
 * customProps should be treated as informational.
 */
function parseProps(source) {
  const props = [];
  const headerRegex = /export\s+interface\s+(\w+Props)\s+(?:extends\s+([^{]+))?\{/g;

  for (const match of matchAll(headerRegex, source)) {
    const name = match[1];
    const extendsClause = match[2]?.trim() || null;

    // extractBraceBlock for balanced {} handling
    const braceStart = match.index + match[0].length - 1; // '{' position
    const block = extractBraceBlock(source, braceStart);
    if (!block) continue;

    const body = block.content.trim();
    const customProps = [];
    if (body) {
      // Strip JSDoc and line comments
      const cleaned = body.replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
      // Use depth-aware tokenizer to split members, not regex
      const members = splitInterfaceMembers(cleaned);
      for (const member of members) {
        const propMatch = member.match(/^(\w+)(\??)\s*:\s*(.+)/s);
        if (propMatch) {
          customProps.push({
            name: propMatch[1],
            type: propMatch[3].trim(),
            required: !propMatch[2],
          });
        }
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

  // Subcomponents: PascalCase exports that are not the main component, variant exports, or ALL_CAPS constants.
  // Note: /^[A-Z][A-Z0-9_]*$/ also matches 2-char uppercase names like "ID" or "UI".
  // This is acceptable since component names should be descriptive (3+ chars).
  const subcomponents = exports.filter(
    (e) => /^[A-Z]/.test(e) && !/^[A-Z][A-Z0-9_]*$/.test(e) && !e.endsWith('Variants') && e !== dir,
  );

  // --- Phase 2C: group, cssArtifact, requiredCssArtifacts, tokenCategories ---
  const group = TAXONOMY[dir];
  if (!group) {
    console.warn(`  WARN: No taxonomy group for "${dir}" — skipping Phase 2C fields`);
  }

  // Phase 3A: direct object lookup from manifest
  const meta = manifest[dir];
  if (!meta) {
    throw new Error(`Missing manifest entry for "${dir}". Add it to component-manifest.json.`);
  }

  const cssArtifact = `styles/components/${basename(meta.cssSource)}`;

  // Read component CSS once for requiredCssArtifacts and tokenCategories detection
  let cssContent = '';
  try {
    cssContent = readFileSync(join(PKG_ROOT, meta.cssSource), 'utf-8');
  } catch {
    // CSS file may not exist for some components
  }

  // requiredCssArtifacts: check if component CSS references shared keyframes
  const usesSharedKeyframes = sharedKeyframes.some((kf) => cssContent.includes(kf));
  const requiredCssArtifacts = usesSharedKeyframes ? ['styles/animations.css'] : [];

  // tokenCategories: scan CSS for --hui-* variable usage
  const tokenCategories = TOKEN_CATEGORIES.filter(({ prefix }) => cssContent.includes(prefix)).map(
    ({ category }) => category,
  );

  const entry = {
    name: dir,
    displayName: displayNames.find((n) => n === dir) || dir,
    group,
    componentSource: meta.componentSource,
    cssArtifact,
    requiredCssArtifacts,
    tokenCategories,
    description: meta.description,
    aiHint: meta.aiHint || undefined,
    peerComponents: meta.peerComponents?.length > 0 ? meta.peerComponents : undefined,
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

// --- Phase 3B: Task bundles ---
const bundlesPath = join(PKG_ROOT, 'data', 'task-bundles.json');
let taskBundles = undefined;
if (existsSync(bundlesPath)) {
  const rawBundles = JSON.parse(readFileSync(bundlesPath, 'utf-8'));
  const componentMap = new Map(components.map((c) => [c.name, c]));
  const bundleNames = new Set();

  taskBundles = rawBundles.map((bundle) => {
    if (bundleNames.has(bundle.name)) {
      throw new Error(`Duplicate bundle name: "${bundle.name}"`);
    }
    bundleNames.add(bundle.name);

    if (typeof bundle.description !== 'string' || bundle.description.length === 0) {
      throw new Error(`Bundle "${bundle.name}" has missing or empty description`);
    }

    if (!bundle.components || bundle.components.length === 0) {
      throw new Error(`Bundle "${bundle.name}" has empty components array`);
    }

    const seen = new Set();
    const allCssArtifacts = new Set();
    const allTokenCategories = new Set();

    for (const compName of bundle.components) {
      if (seen.has(compName)) {
        throw new Error(`Duplicate component "${compName}" in bundle "${bundle.name}"`);
      }
      seen.add(compName);

      const comp = componentMap.get(compName);
      if (!comp) {
        throw new Error(
          `Unknown component "${compName}" in bundle "${bundle.name}". Available: ${[...componentMap.keys()].join(', ')}`,
        );
      }

      allCssArtifacts.add(comp.cssArtifact);
      for (const dep of comp.requiredCssArtifacts) {
        allCssArtifacts.add(dep);
      }
      for (const cat of comp.tokenCategories) {
        allTokenCategories.add(cat);
      }
    }

    return {
      name: bundle.name,
      description: bundle.description,
      components: bundle.components,
      cssArtifacts: [...allCssArtifacts].sort(),
      tokenCategories: [...allTokenCategories].sort(),
    };
  });

  console.log(`Resolved ${taskBundles.length} task bundles`);
}

const registry = {
  $schema: './component-registry.schema.json',
  name: '@hareru/ui',
  version: JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf-8')).version,
  componentCount: components.length,
  components,
  taskBundles,
};

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(registry, null, 2), 'utf-8');
console.log(`Generated dist/component-registry.json (${components.length} components)`);

// Copy schema to dist/ for co-location with the registry
const schemaSource = join(PKG_ROOT, 'data', 'component-registry.schema.json');
if (existsSync(schemaSource)) {
  const schemaDest = join(PKG_ROOT, 'dist', 'component-registry.schema.json');
  copyFileSync(schemaSource, schemaDest);
  console.log('Copied component-registry.schema.json to dist/');
} else {
  console.warn('WARN: data/component-registry.schema.json not found — schema will not be in dist/');
}

// Copy consumer-rules.json to dist/ for @hareru/registry consumption
const consumerRulesSource = join(PKG_ROOT, 'data', 'consumer-rules.json');
if (existsSync(consumerRulesSource)) {
  const consumerRulesDest = join(PKG_ROOT, 'dist', 'consumer-rules.json');
  copyFileSync(consumerRulesSource, consumerRulesDest);
  console.log('Copied consumer-rules.json to dist/');
} else {
  console.warn('WARN: data/consumer-rules.json not found — consumer rules will not be in dist/');
}
