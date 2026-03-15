import { cpSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const distDir = join(scriptDir, '..', 'dist');

mkdirSync(distDir, { recursive: true });

const artifacts = [
  ['@hareru/tokens/tokens.json', 'tokens.json'],
  ['@hareru/tokens/tokens.schema.json', 'tokens.schema.json'],
  ['@hareru/ui/component-registry.json', 'component-registry.json'],
  ['@hareru/ui/component-registry.schema.json', 'component-registry.schema.json'],
  ['@hareru/ui/consumer-rules.json', 'consumer-rules.json'],
];

for (const [pkg, filename] of artifacts) {
  const src = require.resolve(pkg);
  const dest = join(distDir, filename);
  cpSync(src, dest);
  console.log(`Copied ${filename}`);
}
