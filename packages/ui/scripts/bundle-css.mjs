import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');

// --- Source paths (relative to PKG_ROOT) ---

const tokensCss = join(PKG_ROOT, '../tokens/dist/theme.css');
const baselineCss = join(PKG_ROOT, 'src/styles/baseline.css');
const standaloneCss = join(PKG_ROOT, 'src/styles/standalone.css');
const animationsCss = join(PKG_ROOT, 'src/styles/animations.css');
const scopeCss = join(PKG_ROOT, 'src/styles/scope.css');

const componentManifest = JSON.parse(
  readFileSync(join(__dirname, 'component-manifest.json'), 'utf-8'),
);
const componentCssFiles = componentManifest.map((f) => join(PKG_ROOT, f));

// --- Helpers ---

function read(filePath) {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (e) {
    throw new Error(`Failed to read CSS file: ${filePath}`, { cause: e });
  }
}

function concat(paths) {
  return paths.map(read).join('\n\n');
}

// --- Build outputs ---

const distDir = join(PKG_ROOT, 'dist');
const distStylesDir = join(distDir, 'styles');
const distComponentsDir = join(distStylesDir, 'components');
mkdirSync(distComponentsDir, { recursive: true });

// 1. dist/styles/baseline.css — minimal reset only
const baseline = read(baselineCss);
writeFileSync(join(distStylesDir, 'baseline.css'), baseline, 'utf-8');
console.log('  dist/styles/baseline.css');

// 2. dist/styles/components.css — animations + all component CSS (portable contract)
const components = concat([animationsCss, ...componentCssFiles]);
writeFileSync(join(distStylesDir, 'components.css'), components, 'utf-8');
console.log('  dist/styles/components.css');

// 3. dist/styles.css — convenience bundle (tokens + baseline + standalone + animations + components)
const styles = concat([tokensCss, baselineCss, standaloneCss, animationsCss, ...componentCssFiles]);
writeFileSync(join(distDir, 'styles.css'), styles, 'utf-8');
console.log('  dist/styles.css');

// 4. dist/styles/scope.css — .hui-root typography scope helper
const scope = read(scopeCss);
writeFileSync(join(distStylesDir, 'scope.css'), scope, 'utf-8');
console.log('  dist/styles/scope.css');

// 5. dist/styles/animations.css — shared keyframes (for per-component usage)
const animations = read(animationsCss);
writeFileSync(join(distStylesDir, 'animations.css'), animations, 'utf-8');
console.log('  dist/styles/animations.css');

// 6. dist/styles/components.layer.css — portable contract wrapped in @layer hui
const componentsLayer = `@layer hui {\n${components}\n}\n`;
writeFileSync(join(distStylesDir, 'components.layer.css'), componentsLayer, 'utf-8');
console.log('  dist/styles/components.layer.css');

// 7. dist/styles.layer.css — convenience bundle wrapped in @layer hui
const stylesLayer = `@layer hui {\n${styles}\n}\n`;
writeFileSync(join(distDir, 'styles.layer.css'), stylesLayer, 'utf-8');
console.log('  dist/styles.layer.css');

// 8. dist/styles/components/*.css — per-component CSS files
for (const filePath of componentCssFiles) {
  const content = read(filePath);
  const fileName = basename(filePath);
  // Derive component name from directory: src/components/Button/Button.css → Button.css
  writeFileSync(join(distComponentsDir, fileName), content, 'utf-8');
}
console.log(`  dist/styles/components/*.css (${componentCssFiles.length} files)`);

console.log('Bundled CSS complete.');
