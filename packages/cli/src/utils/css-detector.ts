import { existsSync } from 'node:fs';
import { join } from 'node:path';

const CANDIDATES = [
  'src/app/globals.css',
  'src/globals.css',
  'app/globals.css',
  'src/index.css',
  'src/app.css',
  'styles/globals.css',
  'index.css',
];

export function detectCssFile(cwd: string): string | null {
  for (const candidate of CANDIDATES) {
    const fullPath = join(cwd, candidate);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}
