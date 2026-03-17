import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ComponentRegistryJSON,
  ComponentSchemaJSON,
  ConsumerRulesJSON,
  SchemaJSON,
  TokensJSON,
} from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const require = createRequire(import.meta.url);

const cache = new Map<string, unknown>();

const ARTIFACT_SOURCES: Record<string, string> = {
  'tokens.json': '@hareru/tokens/tokens.json',
  'tokens.schema.json': '@hareru/tokens/tokens.schema.json',
  'component-registry.json': '@hareru/ui/component-registry.json',
  'component-registry.schema.json': '@hareru/ui/component-registry.schema.json',
  'consumer-rules.json': '@hareru/ui/consumer-rules.json',
};

function loadJSON<T>(filename: string): T {
  const cached = cache.get(filename);
  if (cached) return cached as T;

  // Production: read from dist/ (bundled artifacts)
  const distPath = join(distDir, filename);
  if (existsSync(distPath)) {
    let raw: string;
    try {
      raw = readFileSync(distPath, 'utf-8');
    } catch (readErr) {
      throw new Error(
        `Failed to read "${filename}" at ${distPath}: ${(readErr as Error).message}`,
        { cause: readErr },
      );
    }

    try {
      const data = JSON.parse(raw) as T;
      cache.set(filename, data);
      return data;
    } catch (parseErr) {
      throw new Error(
        `Failed to parse "${filename}" at ${distPath}: ${(parseErr as Error).message}`,
        { cause: parseErr },
      );
    }
  }

  // Development/test: resolve from workspace packages
  const pkgExport = ARTIFACT_SOURCES[filename];
  if (pkgExport) {
    let filePath: string;
    try {
      filePath = require.resolve(pkgExport);
    } catch (resolveErr) {
      throw new Error(
        `Failed to resolve "${filename}" via ${pkgExport}: ${(resolveErr as Error).message}`,
        { cause: resolveErr },
      );
    }

    let raw: string;
    try {
      raw = readFileSync(filePath, 'utf-8');
    } catch (readErr) {
      throw new Error(
        `Failed to read "${filename}" at ${filePath}: ${(readErr as Error).message}`,
        { cause: readErr },
      );
    }

    try {
      const data = JSON.parse(raw) as T;
      cache.set(filename, data);
      return data;
    } catch (parseErr) {
      throw new Error(
        `Failed to parse "${filename}" at ${filePath}: ${(parseErr as Error).message}`,
        { cause: parseErr },
      );
    }
  }

  // No underlying cause — the artifact simply does not exist at any known path
  throw new Error(
    `"${filename}" not found. Checked: ${distPath}. Run "pnpm build" to generate artifacts.`,
  );
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

export function loadComponentSchema(): ComponentSchemaJSON {
  return loadJSON<ComponentSchemaJSON>('component-registry.schema.json');
}

export function loadConsumerRules(): ConsumerRulesJSON {
  return loadJSON<ConsumerRulesJSON>('consumer-rules.json');
}
