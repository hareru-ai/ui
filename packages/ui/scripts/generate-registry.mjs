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

// --- Phase 3C: State and A11y auto-extraction ---

/** Known boolean state props that can be auto-extracted from source. */
const KNOWN_BOOLEAN_STATES = ['disabled', 'loading', 'streaming', 'open', 'pressed', 'checked'];

/**
 * Extract the root component Props interface body from source.
 * Returns only the body text of `export interface {ComponentName}Props`,
 * excluding subcomponent props, comments, and other code.
 * Returns null if not found.
 */
function extractRootPropsBody(source, componentName) {
  const targetName = `${componentName}Props`;
  const headerRegex = new RegExp(
    `export\\s+interface\\s+${targetName}\\s+(?:extends\\s+[^{]+)?\\{`,
  );
  const match = headerRegex.exec(source);
  if (!match) return null;

  const braceStart = match.index + match[0].length - 1;
  const block = extractBraceBlock(source, braceStart);
  if (!block) return null;

  // Strip JSDoc and line comments to avoid false positives from comment text
  return block.content.replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * Extract known boolean states from the root component's Props interface.
 * Only scans the root {ComponentName}Props body to avoid false positives
 * from subcomponent props and comments.
 * Only extracts KNOWN_BOOLEAN_STATES; enum states must be in manifest.
 */
function extractStates(source, cssSource, componentName) {
  const rootPropsBody = extractRootPropsBody(source, componentName);
  if (!rootPropsBody) return [];

  const states = [];
  const kebabName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  for (const stateName of KNOWN_BOOLEAN_STATES) {
    // Check if the prop is a direct member of the root Props interface
    const propRegex = new RegExp(`\\b${stateName}\\b\\s*[?:]`);
    if (!propRegex.test(rootPropsBody)) continue;

    const state = { name: stateName, type: 'boolean' };

    // Detect CSS reflection: specific data-{stateName} attribute first
    const specificDataAttr = new RegExp(`data-${stateName}[^\\w-]`);
    if (specificDataAttr.test(source)) {
      state.cssReflection = 'data-attribute';
    } else if (cssSource.includes(`hui-${kebabName}--${stateName}`)) {
      // BEM modifier: hui-{component}--{state}
      state.cssReflection = 'modifier';
    } else if (stateName === 'pressed' && /data-state/.test(source)) {
      // data-state='on'|'off' is the standard pattern for pressed state (Base UI)
      state.cssReflection = 'data-attribute';
    }

    states.push(state);
  }

  return states;
}

/** Semantic HTML elements worth detecting in source. */
const SEMANTIC_ELEMENTS = ['output', 'fieldset', 'article', 'details', 'summary'];

/**
 * aria-* attributes to detect.
 * Excluded: aria-hidden (implementation detail, not an a11y feature to surface).
 * Excluded: aria-live (detected separately as liveRegion boolean).
 */
const ARIA_ATTRS_PATTERN = /aria-(?!hidden|live)([\w-]+)/g;

/**
 * Extract a balanced block starting at the given index, where the
 * opening character is `open` and the closing character is `close`.
 * Reuses the same string-literal-skipping logic as extractBraceBlock.
 */
function extractBalancedBlock(str, startIndex, open, close) {
  if (str[startIndex] !== open) return null;
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
    } else if (ch === open) {
      depth++;
    } else if (ch === close) {
      depth--;
    }
    i++;
  }
  if (depth !== 0) return null;
  return { content: str.slice(startIndex + 1, i - 1), end: i };
}

/**
 * Extract the render body of the root component (the forwardRef callback).
 * Handles both block body `=> { ... }` and expression body `=> ( ... )`.
 * Falls back to the entire source if the pattern is not found.
 */
function extractRootRenderBody(source, componentName) {
  // Match: export const ComponentName = forwardRef<...>((
  const pattern = new RegExp(
    `export\\s+const\\s+${componentName}\\s*=\\s*forwardRef[^(]*\\(\\s*\\(`,
  );
  const match = pattern.exec(source);
  if (!match) return source; // fallback: simple wrapper components (e.g., BaseUI re-exports)

  // Skip past the parameter list closing ')'
  let i = match.index + match[0].length;
  let parenDepth = 1;
  while (i < source.length && parenDepth > 0) {
    if (source[i] === '(') parenDepth++;
    else if (source[i] === ')') parenDepth--;
    i++;
  }

  // Find '=>' then either '{' (block body) or '(' (expression body)
  const arrowMatch = source.slice(i).match(/=>\s*([{(])/);
  if (!arrowMatch) return source;

  const bodyStart = i + arrowMatch.index + arrowMatch[0].length - 1;
  const opener = arrowMatch[1];

  if (opener === '{') {
    const block = extractBraceBlock(source, bodyStart);
    return block ? block.content : source;
  }
  // Expression body: => ( ... )
  const block = extractBalancedBlock(source, bodyStart, '(', ')');
  return block ? block.content : source;
}

/**
 * Extract a11y info from the root component's render body only.
 * Scoped to avoid attributing nested child component a11y to the root.
 * Returns partial A11yDef. Manifest values are merged on top.
 */
function extractA11y(source, componentName) {
  const renderBody = extractRootRenderBody(source, componentName);
  const a11y = {};

  // roles: manifest-only. Auto-extraction from JSX is unreliable because
  // role="..." on nested elements (e.g. role="alert" on an error <p>)
  // does not represent the component-level semantics.

  // Detect aria-* attributes (excluding aria-hidden, aria-live)
  const ariaAttrs = new Set();
  for (const m of renderBody.matchAll(ARIA_ATTRS_PATTERN)) {
    ariaAttrs.add(`aria-${m[1]}`);
  }
  if (ariaAttrs.size > 0) a11y.ariaAttributes = [...ariaAttrs].sort();

  // Detect semantic HTML elements
  const semanticElements = SEMANTIC_ELEMENTS.filter(
    (el) => renderBody.includes(`<${el}`) || renderBody.includes(`<${el}>`),
  );
  if (semanticElements.length > 0) a11y.semanticElements = semanticElements;

  // Detect aria-live → liveRegion
  if (/aria-live=/.test(renderBody)) a11y.liveRegion = true;

  return a11y;
}

/**
 * Merge auto-extracted and manifest a11y data.
 * Manifest values take priority for scalar fields; arrays are unioned.
 */
function mergeA11y(auto, manual) {
  if (!manual && Object.keys(auto).length === 0) return undefined;
  if (!manual) return auto;
  if (Object.keys(auto).length === 0) return manual;

  const merged = {};

  // roles: manifest-only (auto-extraction disabled for roles)
  if (manual.roles?.length > 0) merged.roles = manual.roles;

  // ariaAttributes, semanticElements: union (deduplicated), manual order first
  for (const key of ['ariaAttributes', 'semanticElements']) {
    const autoArr = auto[key] || [];
    const manualArr = manual[key] || [];
    const combined = [...new Set([...manualArr, ...autoArr])];
    if (combined.length > 0) merged[key] = combined;
  }

  // keyboardInteractions: manifest only
  if (manual.keyboardInteractions?.length > 0) {
    merged.keyboardInteractions = manual.keyboardInteractions;
  }

  // liveRegion: manifest overrides auto
  if (manual.liveRegion !== undefined) {
    merged.liveRegion = manual.liveRegion;
  } else if (auto.liveRegion !== undefined) {
    merged.liveRegion = auto.liveRegion;
  }

  // notes: manifest only
  if (manual.notes) merged.notes = manual.notes;

  return Object.keys(merged).length > 0 ? merged : undefined;
}

/**
 * Merge auto-extracted and manifest states.
 * Uses `name` as key. Same-name entries: manifest overrides auto.
 */
function mergeStates(auto, manual) {
  if ((!manual || manual.length === 0) && auto.length === 0) return undefined;

  // Manifest order first, then auto-extracted items not in manifest
  const manualNames = new Set((manual || []).map((s) => s.name));
  const result = [...(manual || []), ...auto.filter((s) => !manualNames.has(s.name))];
  return result.length > 0 ? result : undefined;
}

// --- Phase 3D: Slot tree validation ---
const VALID_SLOT_ROLES = [
  'trigger',
  'content',
  'container',
  'item',
  'label',
  'description',
  'action',
  'separator',
  'indicator',
  'viewport',
  'close',
  'icon',
  'input',
  'submenu',
  'anchor',
  'control',
];

/**
 * Validate slot tree integrity.
 * Checks: slot names in subcomponents, no self-parent, valid parent refs,
 * reachability from root, cycle detection, valid roles, no duplicates.
 */
function validateSlotTree(rootName, slots, subcomponents) {
  const subSet = new Set(subcomponents);
  const slotNameSet = new Set(slots.map((s) => s.name));

  // Duplicate name check
  if (slotNameSet.size !== slots.length) {
    const seen = new Set();
    for (const s of slots) {
      if (seen.has(s.name)) {
        throw new Error(`${rootName}: duplicate slot name "${s.name}"`);
      }
      seen.add(s.name);
    }
  }

  for (const s of slots) {
    // Slot name must be in subcomponents
    if (!subSet.has(s.name)) {
      throw new Error(
        `${rootName}: slot "${s.name}" not found in subcomponents [${subcomponents.join(', ')}]`,
      );
    }

    // Self-parent check
    if (s.parent === s.name) {
      throw new Error(`${rootName}: self-parent: ${s.name}`);
    }

    // Parent must be root or another slot
    if (s.parent !== rootName && !slotNameSet.has(s.parent)) {
      throw new Error(`${rootName}: slot "${s.name}" has invalid parent "${s.parent}"`);
    }

    // Valid role
    if (!VALID_SLOT_ROLES.includes(s.role)) {
      throw new Error(`${rootName}: slot "${s.name}" has invalid role "${s.role}"`);
    }
  }

  // 3-color DFS: cycle detection + reachability
  const childMap = new Map();
  for (const s of slots) {
    if (!childMap.has(s.parent)) childMap.set(s.parent, []);
    childMap.get(s.parent).push(s);
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  color.set(rootName, WHITE);
  for (const s of slots) color.set(s.name, WHITE);

  function dfs(node) {
    color.set(node, GRAY);
    for (const child of childMap.get(node) ?? []) {
      const c = color.get(child.name);
      if (c === GRAY) throw new Error(`${rootName}: cycle: ${node} -> ${child.name}`);
      if (c === WHITE) dfs(child.name);
    }
    color.set(node, BLACK);
  }

  dfs(rootName);

  // Reachability: all slots must be BLACK
  for (const s of slots) {
    if (color.get(s.name) !== BLACK) {
      throw new Error(`${rootName}: unreachable slot: ${s.name}`);
    }
  }
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

  // --- Phase 3C: states, a11y, examples ---
  const autoStates = extractStates(source, cssContent, dir);
  const states = mergeStates(autoStates, meta.states);

  // Validate enum state defaultValue is one of values
  if (states) {
    for (const s of states) {
      if (s.type === 'enum' && s.defaultValue && !s.values.includes(s.defaultValue)) {
        throw new Error(
          `${dir}: state "${s.name}" defaultValue "${s.defaultValue}" is not in values [${s.values.join(', ')}]`,
        );
      }
    }
  }

  const autoA11y = extractA11y(source, dir);
  const a11y = mergeA11y(autoA11y, meta.a11y);

  const examples = meta.examples?.length > 0 ? meta.examples : undefined;

  // --- Phase 3D: Slots ---
  let slots = undefined;
  if (meta.slots && meta.slots.length > 0) {
    validateSlotTree(dir, meta.slots, subcomponents);
    slots = meta.slots;
  }

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
    states,
    a11y,
    slots,
    examples,
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
