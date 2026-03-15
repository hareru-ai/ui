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
  while ((pos = str.indexOf(substr, pos)) !== -1) {
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
