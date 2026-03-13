import { cpSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const scriptDir = dirname(new URL(import.meta.url).pathname);
const distDir = join(scriptDir, '..', 'dist');

mkdirSync(distDir, { recursive: true });

const artifacts = [
  ['@hareru/tokens/tokens.json', 'tokens.json'],
  ['@hareru/tokens/tokens.schema.json', 'tokens.schema.json'],
  ['@hareru/ui/component-registry.json', 'component-registry.json'],
];

for (const [pkg, filename] of artifacts) {
  const src = require.resolve(pkg);
  const dest = join(distDir, filename);
  cpSync(src, dest);
  console.log(`Copied ${filename}`);
}

const localArtifacts = [
  [join(scriptDir, '..', 'data', 'consumer-rules.json'), 'consumer-rules.json'],
];

for (const [src, filename] of localArtifacts) {
  const dest = join(distDir, filename);
  cpSync(src, dest);
  console.log(`Copied ${filename}`);
}
