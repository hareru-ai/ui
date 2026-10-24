import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import type { CssMode } from './format.js';
import { detectPackage } from './pkg-detector.js';
import { resolveProjectPath } from './project-path.js';

export type InitMode = Exclude<CssMode, 'per-component'>;

export interface HareruConfig {
  $schema?: string;
  mode: InitMode;
  cssFile: string; // relative to configDir
  framework?: 'next' | 'vite' | 'remix' | 'astro';
  options?: { scope?: boolean; baseline?: boolean; layer?: boolean };
}

/**
 * Resolve the config directory — same directory as the nearest package.json.
 */
export function resolveConfigDir(cwd: string): string {
  const pkg = detectPackage(cwd);
  return pkg.pkgJsonPath ? dirname(pkg.pkgJsonPath) : cwd;
}

/**
 * Load hareru.json from the config directory.
 */
export type LoadConfigResult =
  | { config: HareruConfig; configDir: string; configPath: string; error?: undefined }
  | { config?: undefined; configDir?: undefined; configPath: string; error: string };

export function loadConfig(cwd: string): LoadConfigResult | null {
  const configDir = resolveConfigDir(cwd);
  let configPath = join(configDir, 'hareru.json');
  try {
    configPath = resolveProjectPath(configDir, configPath, 'hareru.json');
  } catch (err) {
    return { configPath, error: (err as Error).message };
  }

  if (!existsSync(configPath)) {
    return null;
  }

  let config: HareruConfig;
  try {
    const raw = readFileSync(configPath, 'utf-8');
    config = JSON.parse(raw) as HareruConfig;
  } catch {
    return { configPath, error: `Failed to parse ${configPath}` };
  }
  if (
    !config ||
    typeof config.cssFile !== 'string' ||
    !config.cssFile ||
    !['standalone', 'portable', 'tailwind'].includes(config.mode)
  ) {
    return { configPath, error: 'Invalid hareru.json: missing required fields (mode, cssFile)' };
  }
  return { config, configDir, configPath };
}

/**
 * Write hareru.json to the config directory.
 * Converts the cssFile absolute path to a relative path from configDir.
 */
export function writeConfig(
  cwd: string,
  config: Omit<HareruConfig, 'cssFile' | '$schema'>,
  cssFileAbsolute: string,
): string {
  const configDir = resolveConfigDir(cwd);
  const configPath = resolveProjectPath(configDir, 'hareru.json', 'hareru.json');
  const safeCssFile = resolveProjectPath(configDir, cssFileAbsolute, 'cssFile');
  const relativeCssFile = relative(realpathSync(configDir), safeCssFile);

  const output: HareruConfig = {
    $schema: 'https://ui.hareru.ai/schema/hareru.json',
    mode: config.mode,
    cssFile: relativeCssFile,
  };

  if (config.framework && config.framework !== 'unknown') {
    output.framework = config.framework as HareruConfig['framework'];
  }

  if (config.options) {
    const opts: HareruConfig['options'] = {};
    if (config.options.scope) opts.scope = true;
    if (config.options.baseline) opts.baseline = true;
    if (config.options.layer) opts.layer = true;
    if (Object.keys(opts).length > 0) {
      output.options = opts;
    }
  }

  writeFileSync(configPath, `${JSON.stringify(output, null, 2)}\n`);
  return configPath;
}

/**
 * Update an existing hareru.json with new values.
 */
export function updateConfig(
  configPath: string,
  updates: Partial<Pick<HareruConfig, 'mode' | 'options'>>,
): void {
  const safeConfigPath = resolveProjectPath(dirname(configPath), configPath, 'hareru.json');
  let config: HareruConfig;
  try {
    const raw = readFileSync(safeConfigPath, 'utf-8');
    config = JSON.parse(raw) as HareruConfig;
  } catch (err) {
    throw new Error(`Failed to parse ${configPath}: ${(err as Error).message}`);
  }

  if (updates.mode !== undefined) {
    config.mode = updates.mode;
  }

  if (updates.options !== undefined) {
    const merged = { ...config.options, ...updates.options };
    // Build clean object with only truthy values
    const clean: HareruConfig['options'] = {};
    if (merged.scope) clean.scope = true;
    if (merged.baseline) clean.baseline = true;
    if (merged.layer) clean.layer = true;
    config.options = Object.keys(clean).length > 0 ? clean : undefined;
  }

  writeFileSync(safeConfigPath, `${JSON.stringify(config, null, 2)}\n`);
}

/**
 * Resolve cssFile path from config — configDir + relative path.
 * Rejects paths that escape the project root (path traversal prevention).
 */
export function resolveCssFilePath(configDir: string, relativePath: string): string {
  return resolveProjectPath(configDir, relativePath, 'cssFile');
}
