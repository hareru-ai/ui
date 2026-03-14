import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const dataDir = join(__dirname, '..', 'data');
const require = createRequire(import.meta.url);

const cache = new Map<string, unknown>();

const ARTIFACT_SOURCES: Record<string, string> = {
  'tokens.json': '@hareru/tokens/tokens.json',
  'tokens.schema.json': '@hareru/tokens/tokens.schema.json',
  'component-registry.json': '@hareru/ui/component-registry.json',
};

function loadJSON<T>(filename: string): T {
  const cached = cache.get(filename);
  if (cached) return cached as T;

  // Production: read from dist/ (bundled artifacts)
  const distPath = join(distDir, filename);
  if (existsSync(distPath)) {
    const raw = readFileSync(distPath, 'utf-8');
    const data = JSON.parse(raw) as T;
    cache.set(filename, data);
    return data;
  }

  // Development/test: resolve from workspace packages
  const pkgExport = ARTIFACT_SOURCES[filename];
  if (pkgExport) {
    try {
      const filePath = require.resolve(pkgExport);
      const raw = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw) as T;
      cache.set(filename, data);
      return data;
    } catch {
      // fall through to error
    }
  }

  throw new Error(`Failed to load "${filename}". Run "pnpm build" first. Checked: ${distPath}`);
}

export interface TokensJSON {
  light: Record<string, unknown>;
  dark: Record<string, unknown>;
}

export interface SchemaJSON {
  $schema: string;
  title: string;
  description: string;
  properties: {
    cssVariables: { items: { enum: string[] } };
    tokenPaths: { items: { enum: string[] } };
    typeConstraints: {
      properties: Record<string, { pattern?: string; type?: string; description?: string }>;
    };
    tokenCount: { const: number };
  };
}

export interface ComponentRegistryJSON {
  $schema: string;
  name: string;
  version: string;
  componentCount: number;
  components: ComponentEntry[];
}

export type ComponentGroup =
  | 'core'
  | 'form'
  | 'layout'
  | 'overlay'
  | 'navigation'
  | 'feedback'
  | 'data-display'
  | 'agent'
  | 'di-domain';

export type TokenCategory =
  | 'color'
  | 'spacing'
  | 'radius'
  | 'font'
  | 'typography'
  | 'shadow'
  | 'duration'
  | 'easing'
  | 'zIndex';

export interface ComponentEntry {
  name: string;
  displayName: string;
  group: ComponentGroup;
  cssArtifact: string;
  requiredCssArtifacts: string[];
  tokenCategories: TokenCategory[];
  subcomponents?: string[];
  variants?: VariantDef[];
  props?: PropDef[];
}

interface VariantDef {
  name: string;
  variants: Record<string, string[]>;
  defaultVariants: Record<string, string>;
}

interface PropDef {
  name: string;
  extends: string | null;
}

export function loadTokens(): TokensJSON {
  return loadJSON<TokensJSON>('tokens.json');
}

export function loadSchema(): SchemaJSON {
  return loadJSON<SchemaJSON>('tokens.schema.json');
}

export function loadRegistry(): ComponentRegistryJSON {
  return loadJSON<ComponentRegistryJSON>('component-registry.json');
}

export interface ConsumerRulesJSON {
  version: string;
  rules: Record<
    string,
    {
      description: string;
      rules: string[];
      examples: Record<string, string>;
    }
  >;
  tokenQuickReference: Record<string, string>;
}

export function loadConsumerRules(): ConsumerRulesJSON {
  const filename = 'consumer-rules.json';
  const cached = cache.get(filename);
  if (cached) return cached as ConsumerRulesJSON;

  // Production: read from dist/ (bundled artifacts)
  const distPath = join(distDir, filename);
  if (existsSync(distPath)) {
    const raw = readFileSync(distPath, 'utf-8');
    const data = JSON.parse(raw) as ConsumerRulesJSON;
    cache.set(filename, data);
    return data;
  }

  // Development/test: read from data/ directory in the mcp package
  const dataPath = join(dataDir, filename);
  if (existsSync(dataPath)) {
    const raw = readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw) as ConsumerRulesJSON;
    cache.set(filename, data);
    return data;
  }

  throw new Error(`Failed to load "${filename}". Checked: ${distPath}, ${dataPath}`);
}
