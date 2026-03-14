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

const componentCssFiles = [
  'src/components/AspectRatio/AspectRatio.css',
  'src/components/Alert/Alert.css',
  'src/components/AlertDialog/AlertDialog.css',
  'src/components/AsyncComboboxField/AsyncComboboxField.css',
  'src/components/Avatar/Avatar.css',
  'src/components/Badge/Badge.css',
  'src/components/BentoGrid/BentoGrid.css',
  'src/components/Button/Button.css',
  'src/components/Card/Card.css',
  'src/components/Collapsible/Collapsible.css',
  'src/components/Combobox/Combobox.css',
  'src/components/Command/Command.css',
  'src/components/ConfidenceBadge/ConfidenceBadge.css',
  'src/components/Dialog/Dialog.css',
  'src/components/DropdownMenu/DropdownMenu.css',
  'src/components/EmptyState/EmptyState.css',
  'src/components/FieldDiff/FieldDiff.css',
  'src/components/FormField/FormField.css',
  'src/components/Input/Input.css',
  'src/components/KeyValueList/KeyValueList.css',
  'src/components/Label/Label.css',
  'src/components/NavigationMenu/NavigationMenu.css',
  'src/components/Popover/Popover.css',
  'src/components/Progress/Progress.css',
  'src/components/QueryFeedback/QueryFeedback.css',
  'src/components/ReadonlyField/ReadonlyField.css',
  'src/components/ScrollArea/ScrollArea.css',
  'src/components/Select/Select.css',
  'src/components/SemanticSuggest/SemanticSuggest.css',
  'src/components/Separator/Separator.css',
  'src/components/Sheet/Sheet.css',
  'src/components/Skeleton/Skeleton.css',
  'src/components/Switch/Switch.css',
  'src/components/Table/Table.css',
  'src/components/Tabs/Tabs.css',
  'src/components/Textarea/Textarea.css',
  'src/components/Toast/Toast.css',
  'src/components/Toggle/Toggle.css',
  'src/components/Tooltip/Tooltip.css',
  'src/components/ChatContainer/ChatContainer.css',
  'src/components/ChatMessage/ChatMessage.css',
  'src/components/StreamingText/StreamingText.css',
  'src/components/MetricCard/MetricCard.css',
  'src/components/DefinitionBrowser/DefinitionBrowser.css',
  'src/components/DataQualityIndicator/DataQualityIndicator.css',
  'src/components/ToolCallCard/ToolCallCard.css',
  'src/components/ApprovalCard/ApprovalCard.css',
  'src/components/ChatComposer/ChatComposer.css',
  'src/components/ReasoningPanel/ReasoningPanel.css',
].map((f) => join(PKG_ROOT, f));

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
const styles = concat([
  tokensCss,
  baselineCss,
  standaloneCss,
  animationsCss,
  ...componentCssFiles,
]);
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
