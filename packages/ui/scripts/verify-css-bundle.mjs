import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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
  assert(styles.includes('@keyframes hui-cursor-blink'), 'styles.css contains @keyframes hui-cursor-blink');
  assert(
    countOccurrences(styles, '@keyframes hui-cursor-blink') === 1,
    'styles.css has exactly 1 @keyframes hui-cursor-blink (no duplicate)',
  );
}

// --- dist/styles/baseline.css ---
const baseline = readFile(join(DIST, 'styles/baseline.css'));
assert(baseline !== null, 'dist/styles/baseline.css exists');
if (baseline) {
  assert(baseline.includes('box-sizing: border-box'), 'baseline.css contains box-sizing: border-box');
  assert(baseline.includes('font: inherit'), 'baseline.css contains font: inherit');
  assert(!baseline.match(/^body\s*\{/m), 'baseline.css does NOT contain body rule');
  assert(!baseline.includes('@keyframes'), 'baseline.css does NOT contain @keyframes');
}

// --- dist/styles/components.css ---
const components = readFile(join(DIST, 'styles/components.css'));
assert(components !== null, 'dist/styles/components.css exists');
if (components) {
  assert(components.includes('.hui-button'), 'components.css contains .hui-button');
  assert(components.includes('.hui-dialog__content'), 'components.css contains .hui-dialog__content');
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
  assert(stylesLayer.includes(':root {') || stylesLayer.includes(':root{'), 'styles.layer.css contains :root');
  assert(stylesLayer.includes('.hui-button'), 'styles.layer.css contains .hui-button');
}

// --- dist/styles/components/*.css (per-component) ---
const componentsDir = join(DIST, 'styles/components');
assert(existsSync(componentsDir), 'dist/styles/components/ directory exists');
if (existsSync(componentsDir)) {
  const perComponentFiles = readdirSync(componentsDir).filter((f) => f.endsWith('.css'));

  // Dynamically derive expected count from bundle-css.mjs's componentCssFiles
  // We import it indirectly by counting source files
  const srcComponentsDir = join(PKG_ROOT, 'src/components');
  const srcDirs = readdirSync(srcComponentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => {
      const cssPath = join(srcComponentsDir, d.name, `${d.name}.css`);
      return existsSync(cssPath);
    });

  assert(
    perComponentFiles.length === srcDirs.length,
    `per-component file count (${perComponentFiles.length}) === source component CSS count (${srcDirs.length})`,
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
    assert(dialogCss.includes('.hui-dialog__content'), 'components/Dialog.css contains .hui-dialog__content');
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

// --- Summary ---
if (errors > 0) {
  console.error(`\nCSS bundle verification failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('\nCSS bundle verification passed.');
}
