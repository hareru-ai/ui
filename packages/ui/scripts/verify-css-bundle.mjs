import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, basename as pathBasename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const DIST = join(PKG_ROOT, 'dist');

let errors = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    errors++;
  } else {
    console.log(`  OK: ${message}`);
  }
}

function readFile(filePath) {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function countOccurrences(str, substr) {
  let count = 0;
  let pos = 0;
  for (pos = str.indexOf(substr, pos); pos !== -1; pos = str.indexOf(substr, pos)) {
    count++;
    pos += substr.length;
  }
  return count;
}

// --- Component manifest (loaded once, used in multiple sections) ---
const manifestPath = join(PKG_ROOT, 'scripts', 'component-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

console.log('Verifying CSS bundle...');

// --- dist/styles.css ---
const styles = readFile(join(DIST, 'styles.css'));
assert(styles !== null, 'dist/styles.css exists');
if (styles) {
  assert(styles.includes(':root {') || styles.includes(':root{'), 'styles.css contains :root');
  assert(styles.match(/^body\s*\{/m), 'styles.css contains body rule');
  assert(styles.includes('box-sizing'), 'styles.css contains box-sizing');
  assert(styles.includes('-webkit-text-size-adjust'), 'styles.css contains standalone reset');
  assert(styles.includes('.hui-button'), 'styles.css contains .hui-button');
  assert(styles.includes('.hui-dialog__content'), 'styles.css contains .hui-dialog__content');
  assert(
    styles.includes('@keyframes hui-cursor-blink'),
    'styles.css contains @keyframes hui-cursor-blink',
  );
  assert(
    countOccurrences(styles, '@keyframes hui-cursor-blink') === 1,
    'styles.css has exactly 1 @keyframes hui-cursor-blink (no duplicate)',
  );
}

// --- dist/styles/baseline.css ---
const baseline = readFile(join(DIST, 'styles/baseline.css'));
assert(baseline !== null, 'dist/styles/baseline.css exists');
if (baseline) {
  assert(
    baseline.includes('box-sizing: border-box'),
    'baseline.css contains box-sizing: border-box',
  );
  assert(baseline.includes('font: inherit'), 'baseline.css contains font: inherit');
  assert(!baseline.match(/^body\s*\{/m), 'baseline.css does NOT contain body rule');
  assert(!baseline.includes('@keyframes'), 'baseline.css does NOT contain @keyframes');
}

// --- dist/styles/components.css ---
const components = readFile(join(DIST, 'styles/components.css'));
assert(components !== null, 'dist/styles/components.css exists');
if (components) {
  assert(components.includes('.hui-button'), 'components.css contains .hui-button');
  assert(
    components.includes('.hui-dialog__content'),
    'components.css contains .hui-dialog__content',
  );
  assert(
    components.includes('@keyframes hui-cursor-blink'),
    'components.css contains @keyframes hui-cursor-blink',
  );
  assert(!components.match(/^body\s*\{/m), 'components.css does NOT contain top-level body rule');
  assert(
    !components.includes(':root {') && !components.includes(':root{'),
    'components.css does NOT contain :root',
  );

  // Verify previously missing 8 components
  const missing = [
    '.hui-confidence-badge',
    '.hui-table',
    '.hui-readonly-field',
    '.hui-key-value-list',
    '.hui-field-diff',
    '.hui-async-combobox-field',
    '.hui-query-feedback',
    '.hui-semantic-suggest',
  ];
  for (const cls of missing) {
    assert(components.includes(cls), `components.css contains ${cls}`);
  }

  // Verify overlay surfaces have font-family in components.css
  const overlaySelectors = [
    '.hui-dialog__content',
    '.hui-sheet__content',
    '.hui-alert-dialog__content',
    '.hui-toast',
    '.hui-popover__content',
    '.hui-combobox__content',
    '.hui-command-dialog__content',
    '.hui-select__content',
    '.hui-dropdown-menu__content',
    '.hui-dropdown-menu__sub-content',
    '.hui-navigation-menu__popup',
    '.hui-tooltip__content',
  ];
  for (const sel of overlaySelectors) {
    assert(components.includes(sel), `components.css contains ${sel}`);
  }
}

// --- dist/styles/scope.css ---
const scope = readFile(join(DIST, 'styles/scope.css'));
assert(scope !== null, 'dist/styles/scope.css exists');
if (scope) {
  assert(scope.includes('.hui-root'), 'scope.css contains .hui-root');
  assert(scope.includes('font-family'), 'scope.css contains font-family');
  assert(!scope.match(/^body\s*\{/m), 'scope.css does NOT contain body rule');
  assert(!scope.includes('background-color'), 'scope.css does NOT contain background-color');
}

// --- dist/styles/animations.css ---
const animations = readFile(join(DIST, 'styles/animations.css'));
assert(animations !== null, 'dist/styles/animations.css exists');
if (animations) {
  assert(animations.includes('@keyframes'), 'animations.css contains @keyframes');
}

// --- dist/styles/components.layer.css ---
const componentsLayer = readFile(join(DIST, 'styles/components.layer.css'));
assert(componentsLayer !== null, 'dist/styles/components.layer.css exists');
if (componentsLayer) {
  assert(componentsLayer.includes('@layer hui'), 'components.layer.css contains @layer hui');
  assert(componentsLayer.includes('.hui-button'), 'components.layer.css contains .hui-button');
  assert(
    !componentsLayer.includes(':root {') && !componentsLayer.includes(':root{'),
    'components.layer.css does NOT contain :root',
  );
}

// --- dist/styles.layer.css ---
const stylesLayer = readFile(join(DIST, 'styles.layer.css'));
assert(stylesLayer !== null, 'dist/styles.layer.css exists');
if (stylesLayer) {
  assert(stylesLayer.includes('@layer hui'), 'styles.layer.css contains @layer hui');
  assert(
    stylesLayer.includes(':root {') || stylesLayer.includes(':root{'),
    'styles.layer.css contains :root',
  );
  assert(stylesLayer.includes('.hui-button'), 'styles.layer.css contains .hui-button');
}

// --- dist/styles/components/*.css (per-component) ---
const componentsDir = join(DIST, 'styles/components');
assert(existsSync(componentsDir), 'dist/styles/components/ directory exists');
if (existsSync(componentsDir)) {
  const perComponentFiles = readdirSync(componentsDir).filter((f) => f.endsWith('.css'));

  // Use component-manifest.json (loaded below) as the single source of truth for expected count
  const manifestKeyCount = Object.keys(manifest).length;

  assert(
    perComponentFiles.length === manifestKeyCount,
    `per-component file count (${perComponentFiles.length}) === manifest count (${manifestKeyCount})`,
  );

  // Spot-check individual files
  const buttonCss = readFile(join(componentsDir, 'Button.css'));
  assert(buttonCss !== null, 'components/Button.css exists');
  if (buttonCss) {
    assert(buttonCss.includes('.hui-button'), 'components/Button.css contains .hui-button');
  }

  const dialogCss = readFile(join(componentsDir, 'Dialog.css'));
  assert(dialogCss !== null, 'components/Dialog.css exists');
  if (dialogCss) {
    assert(
      dialogCss.includes('.hui-dialog__content'),
      'components/Dialog.css contains .hui-dialog__content',
    );
  }
}

// --- Export resolution smoke test ---
console.log('\nExport resolution smoke test...');
const pkgJson = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf-8'));
const exportPaths = [
  ['./styles/components/Button.css', 'Button.css per-component export'],
  ['./styles/components.layer.css', 'components.layer.css export'],
  ['./styles/scope.css', 'scope.css export'],
  ['./styles/animations.css', 'animations.css export'],
  ['./styles.layer.css', 'styles.layer.css export'],
  ['./component-registry.schema.json', 'component-registry.schema.json export'],
];

for (const [exportPath, label] of exportPaths) {
  // Check if the export is defined in package.json
  const exportsMap = pkgJson.exports;

  // For wildcard patterns, resolve manually
  let resolvedTarget = exportsMap[exportPath];
  if (!resolvedTarget) {
    // Check wildcard patterns like ./styles/components/*.css
    for (const [pattern, target] of Object.entries(exportsMap)) {
      if (pattern.includes('*')) {
        // Escape regex special chars except *, then replace * with (.*)
        const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace('*', '(.*)');
        const regex = new RegExp(`^${escaped}$`);
        const match = exportPath.match(regex);
        if (match) {
          resolvedTarget = target.replace('*', match[1]);
          break;
        }
      }
    }
  }

  assert(resolvedTarget, `package.json exports contains ${exportPath} (${label})`);

  if (resolvedTarget) {
    const resolvedFile = join(PKG_ROOT, resolvedTarget);
    assert(existsSync(resolvedFile), `${resolvedTarget} file exists on disk`);
  }
}

// --- Artifact consistency (component-manifest.json ↔ dist ↔ registry) ---
console.log('\nArtifact consistency check...');

const manifestNames = Object.keys(manifest);

// --- Manifest metadata validation ---
console.log('\nManifest metadata validation...');

for (const [name, meta] of Object.entries(manifest)) {
  // Source file existence
  const tsxPath = join(PKG_ROOT, meta.componentSource);
  assert(existsSync(tsxPath), `manifest: ${name} componentSource exists (${meta.componentSource})`);
  const cssPath = join(PKG_ROOT, meta.cssSource);
  assert(existsSync(cssPath), `manifest: ${name} cssSource exists (${meta.cssSource})`);

  // Name consistency: key === basename(componentSource) === basename(cssSource)
  const tsxName = pathBasename(meta.componentSource, '.tsx');
  const cssName = pathBasename(meta.cssSource, '.css');
  assert(name === tsxName, `manifest: key "${name}" === componentSource basename "${tsxName}"`);
  assert(name === cssName, `manifest: key "${name}" === cssSource basename "${cssName}"`);

  // Canonical path enforcement
  const expectedTsx = `src/components/${name}/${name}.tsx`;
  const expectedCss = `src/components/${name}/${name}.css`;
  assert(
    meta.componentSource === expectedTsx,
    `manifest: ${name} componentSource is canonical (${expectedTsx})`,
  );
  assert(
    meta.cssSource === expectedCss,
    `manifest: ${name} cssSource is canonical (${expectedCss})`,
  );

  // description is required and non-empty
  assert(
    typeof meta.description === 'string' && meta.description.length > 0,
    `manifest: ${name} has non-empty description`,
  );

  // peerComponents validation
  if (meta.peerComponents) {
    assert(Array.isArray(meta.peerComponents), `manifest: ${name} peerComponents is array`);
    // No self-reference
    assert(
      !meta.peerComponents.includes(name),
      `manifest: ${name} peerComponents has no self-reference`,
    );
    // No duplicates
    const uniquePeers = new Set(meta.peerComponents);
    assert(
      uniquePeers.size === meta.peerComponents.length,
      `manifest: ${name} peerComponents has no duplicates`,
    );
    // All references exist in manifest
    for (const peer of meta.peerComponents) {
      assert(
        manifest[peer] !== undefined,
        `manifest: ${name} peerComponent "${peer}" exists in manifest`,
      );
    }
  }
}

// 1. Every manifest entry has a corresponding dist/styles/components/{Name}.css
for (const name of manifestNames) {
  const distFile = join(DIST, 'styles', 'components', `${name}.css`);
  assert(existsSync(distFile), `manifest → dist: ${name}.css exists`);
}

// 2. Registry consistency
const registryPath = join(DIST, 'component-registry.json');
if (existsSync(registryPath)) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
  const registryNames = registry.components.map((c) => c.name);

  // Every registry entry has cssArtifact and group set (catches TAXONOMY update omission)
  const VALID_GROUPS = [
    'core',
    'form',
    'layout',
    'overlay',
    'navigation',
    'feedback',
    'data-display',
    'agent',
    'di-domain',
  ];
  for (const comp of registry.components) {
    assert(
      comp.cssArtifact !== undefined && comp.cssArtifact !== null,
      `registry: ${comp.name} has cssArtifact`,
    );
    assert(
      VALID_GROUPS.includes(comp.group),
      `registry: ${comp.name} has valid group "${comp.group}"`,
    );
  }

  // 3. Three-way consistency: manifest ↔ registry (incl. taxonomy) ↔ dist
  const manifestSet = new Set(manifestNames);
  const registrySet = new Set(registryNames);

  // Check manifest entries are all in registry
  for (const name of manifestNames) {
    assert(registrySet.has(name), `manifest → registry: ${name} exists in registry`);
  }

  // Check registry entries with cssArtifact are all in manifest
  for (const comp of registry.components) {
    if (comp.cssArtifact) {
      // cssArtifact is "styles/components/Button.css" → extract "Button"
      const fileName = comp.cssArtifact.split('/').pop().replace('.css', '');
      assert(manifestSet.has(fileName), `registry → manifest: ${fileName} exists in manifest`);
    }
  }

  const distComponentCount = existsSync(componentsDir)
    ? readdirSync(componentsDir).filter((f) => f.endsWith('.css')).length
    : 0;
  assert(
    manifestNames.length === distComponentCount,
    `manifest count (${manifestNames.length}) === dist count (${distComponentCount})`,
  );
  console.log(
    `  Manifest: ${manifestNames.length}, Registry: ${registryNames.length}, Dist: ${distComponentCount}`,
  );

  // --- Schema-derived validation ---
  console.log('\nSchema-derived validation...');
  const schemaPath = join(DIST, 'component-registry.schema.json');
  if (existsSync(schemaPath)) {
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

    // Resolve $ref pointers (one level, local $defs only)
    const resolveRef = (node) => {
      if (node?.$ref?.startsWith('#/$defs/')) {
        const defName = node.$ref.replace('#/$defs/', '');
        return schema.$defs?.[defName] || node;
      }
      return node;
    };

    // Check for unknown keys against schema properties (enforces additionalProperties: false)
    const checkUnknownKeys = (obj, schemaNode, label) => {
      if (!schemaNode?.properties || schemaNode.additionalProperties !== false) return;
      const allowed = new Set(Object.keys(schemaNode.properties));
      for (const key of Object.keys(obj)) {
        assert(allowed.has(key), `schema-derived: ${label} has no unknown key "${key}"`);
      }
    };

    // Check that present fields have correct nullability per schema
    const checkNullability = (obj, schemaNode, label) => {
      if (!schemaNode?.properties) return;
      for (const [key, value] of Object.entries(obj)) {
        if (value === null) {
          const propSchema = schemaNode.properties[key];
          if (!propSchema) continue;
          // Schema allows null if type includes "null" (e.g. ["string", "null"])
          const allowsNull = Array.isArray(propSchema.type)
            ? propSchema.type.includes('null')
            : propSchema.type === 'null';
          assert(allowsNull, `schema-derived: ${label} field "${key}" should not be null`);
        }
      }
    };

    // 1. Top-level required fields + unknown keys
    if (schema.required) {
      for (const field of schema.required) {
        assert(registry[field] !== undefined, `schema-derived: top-level "${field}" is present`);
      }
    }
    checkUnknownKeys(registry, schema, 'top-level');

    // 2. Component entry validation
    const compSchema = resolveRef(schema.properties?.components?.items);
    if (compSchema && registry) {
      const compRequired = compSchema.required || [];
      const groupEnum = compSchema.properties?.group?.enum;

      for (const comp of registry.components) {
        for (const field of compRequired) {
          assert(
            comp[field] !== undefined,
            `schema-derived: ${comp.name} has required field "${field}"`,
          );
        }
        if (groupEnum) {
          assert(
            groupEnum.includes(comp.group),
            `schema-derived: ${comp.name} group "${comp.group}" is valid enum`,
          );
        }
        checkUnknownKeys(comp, compSchema, `component ${comp.name}`);
        checkNullability(comp, compSchema, `component ${comp.name}`);
      }
    }

    // 3. Task bundle validation
    const bundleSchema = resolveRef(schema.properties?.taskBundles?.items);
    if (bundleSchema && registry?.taskBundles) {
      const bundleRequired = bundleSchema.required || [];
      const registryNameSet = new Set(registry.components.map((c) => c.name));

      for (const bundle of registry.taskBundles) {
        for (const field of bundleRequired) {
          assert(
            bundle[field] !== undefined,
            `schema-derived: bundle "${bundle.name}" has required field "${field}"`,
          );
        }
        // Check component references exist
        for (const compName of bundle.components) {
          assert(
            registryNameSet.has(compName),
            `schema-derived: bundle "${bundle.name}" component "${compName}" exists in registry`,
          );
        }
        checkUnknownKeys(bundle, bundleSchema, `bundle ${bundle.name}`);
        checkNullability(bundle, bundleSchema, `bundle ${bundle.name}`);
      }
    }
  } else {
    console.log('  SKIP: component-registry.schema.json not found');
  }

  // --- Enum state integrity checks ---
  console.log('\nEnum state integrity checks...');

  for (const comp of registry.components) {
    for (const state of comp.states ?? []) {
      if (state.type === 'enum') {
        assert(
          Array.isArray(state.values) && state.values.length > 0,
          `enum-state: ${comp.name}.${state.name} has non-empty values array`,
        );
        if (state.defaultValue !== undefined && state.defaultValue !== null) {
          assert(
            state.values.includes(state.defaultValue),
            `enum-state: ${comp.name}.${state.name} defaultValue "${state.defaultValue}" is in values`,
          );
        }
      }
    }
  }

  // --- Phase 3C: states / a11y / examples representative checks ---
  console.log('\nPhase 3C representative checks...');

  const approvalCard = registry.components.find((c) => c.name === 'ApprovalCard');
  if (approvalCard) {
    const statusState = approvalCard.states?.find((s) => s.name === 'status');
    assert(statusState?.type === 'enum', 'Phase 3C: ApprovalCard has status enum state');
    assert(
      statusState?.values?.includes('pending'),
      'Phase 3C: ApprovalCard status includes "pending"',
    );
  }

  const streamingText = registry.components.find((c) => c.name === 'StreamingText');
  if (streamingText) {
    assert(
      streamingText.a11y?.liveRegion === true,
      'Phase 3C: StreamingText a11y.liveRegion === true',
    );
    assert(
      streamingText.a11y?.semanticElements?.includes('output'),
      'Phase 3C: StreamingText a11y.semanticElements includes "output"',
    );
  }

  const button = registry.components.find((c) => c.name === 'Button');
  if (button) {
    assert(
      button.examples?.length > 0 && button.examples[0].code?.length > 0,
      'Phase 3C: Button has examples with non-empty code',
    );
  }

  // --- Phase 3C: manifest a11y cross-check against source ---
  console.log('\nPhase 3C manifest a11y cross-check...');

  for (const comp of registry.components) {
    for (const el of comp.a11y?.semanticElements ?? []) {
      const tsxPath = join(PKG_ROOT, comp.componentSource);
      if (existsSync(tsxPath)) {
        const src = readFileSync(tsxPath, 'utf-8');
        assert(
          src.includes(`<${el}`),
          `Phase 3C: ${comp.name}.a11y.semanticElements["${el}"] found in source`,
        );
      }
    }
  }

  // --- Phase 3D: slots representative checks ---
  console.log('\nPhase 3D slots checks...');

  const dialog3d = registry.components.find((c) => c.name === 'Dialog');
  if (dialog3d) {
    assert(Array.isArray(dialog3d.slots), 'Phase 3D: Dialog has slots array');
    assert(
      dialog3d.slots.length >= 7,
      `Phase 3D: Dialog has >= 7 slots (got ${dialog3d.slots?.length})`,
    );
    const trigger = dialog3d.slots.find((s) => s.name === 'DialogTrigger');
    assert(trigger?.role === 'trigger', 'Phase 3D: DialogTrigger role is trigger');
    assert(trigger?.parent === 'Dialog', 'Phase 3D: DialogTrigger parent is Dialog');
    const title = dialog3d.slots.find((s) => s.name === 'DialogTitle');
    assert(title?.parent === 'DialogContent', 'Phase 3D: DialogTitle parent is DialogContent');
    assert(title?.role === 'label', 'Phase 3D: DialogTitle role is label');
  }

  const tabs3d = registry.components.find((c) => c.name === 'Tabs');
  if (tabs3d) {
    const tabsTrigger = tabs3d.slots?.find((s) => s.name === 'TabsTrigger');
    assert(tabsTrigger?.parent === 'TabsList', 'Phase 3D: TabsTrigger parent is TabsList');
  }

  const toast3d = registry.components.find((c) => c.name === 'Toast');
  assert(!toast3d?.slots, 'Phase 3D: Toast has no slots');

  // DropdownMenu Sub chain check
  const dm3d = registry.components.find((c) => c.name === 'DropdownMenu');
  if (dm3d) {
    const sub = dm3d.slots?.find((s) => s.name === 'DropdownMenuSub');
    assert(sub?.role === 'submenu', 'Phase 3D: DropdownMenuSub role is submenu');
    assert(
      sub?.parent === 'DropdownMenuContent',
      'Phase 3D: DropdownMenuSub parent is DropdownMenuContent',
    );
    const subTrigger = dm3d.slots?.find((s) => s.name === 'DropdownMenuSubTrigger');
    assert(
      subTrigger?.parent === 'DropdownMenuSub',
      'Phase 3D: DropdownMenuSubTrigger parent is DropdownMenuSub',
    );
  }

  // Verify all slots in components with slots are reachable from root
  for (const comp of registry.components) {
    if (!comp.slots || comp.slots.length === 0) continue;
    const reachable = new Set([comp.name]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const s of comp.slots) {
        if (reachable.has(s.parent) && !reachable.has(s.name)) {
          reachable.add(s.name);
          changed = true;
        }
      }
    }
    for (const s of comp.slots) {
      assert(
        reachable.has(s.name),
        `Phase 3D: ${comp.name} slot "${s.name}" is reachable from root`,
      );
    }
  }

  // --- Registry snapshot checks ---
  console.log('\nRegistry snapshot checks...');
  const ad = registry.components.find((c) => c.name === 'AlertDialog');
  assert(ad?.displayName === 'AlertDialog', 'snapshot: AlertDialog.displayName === "AlertDialog"');

  const bg = registry.components.find((c) => c.name === 'BentoGrid');
  assert(
    !bg?.subcomponents?.includes('BENTO_PRESETS'),
    'snapshot: BentoGrid.subcomponents does not contain "BENTO_PRESETS"',
  );

  const bgProps = bg?.props?.flatMap((p) => p.customProps ?? []) ?? [];
  assert(
    !bgProps.find((p) => p.name === 'default'),
    'snapshot: BentoGrid.props has no bogus "default" property',
  );
} else {
  console.log('  SKIP: component-registry.json not found (run generate-registry first)');
}

// --- Summary ---
if (errors > 0) {
  console.error(`\nCSS bundle verification failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('\nCSS bundle verification passed.');
}
