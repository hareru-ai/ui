import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeCssImports } from '../utils/css-writer.js';

let testDir: string;

beforeEach(() => {
  testDir = join(tmpdir(), `hareru-css-writer-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });
});

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true });
});

function createFile(name: string, content: string): string {
  const filePath = join(testDir, name);
  writeFileSync(filePath, content);
  return filePath;
}

describe('writeCssImports', () => {
  it('adds imports to empty file', () => {
    const file = createFile('test.css', '');
    const result = writeCssImports(file, [
      "@import '@hareru/tokens/css';",
      "@import '@hareru/ui/styles/components/Button.css';",
    ]);
    expect(result.added).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
    const content = readFileSync(file, 'utf-8');
    expect(content).toContain("@import '@hareru/tokens/css';");
    expect(content).toContain("@import '@hareru/ui/styles/components/Button.css';");
  });

  it('appends after existing imports', () => {
    const file = createFile('test.css', "@import '@hareru/tokens/css';\n\nbody { margin: 0; }\n");
    const result = writeCssImports(file, ["@import '@hareru/ui/styles/components/Button.css';"]);
    expect(result.added).toHaveLength(1);
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const tokenIdx = lines.findIndex((l) => l.includes('@hareru/tokens/css'));
    const buttonIdx = lines.findIndex((l) => l.includes('Button.css'));
    expect(buttonIdx).toBe(tokenIdx + 1);
  });

  it('skips duplicate imports', () => {
    const file = createFile('test.css', "@import '@hareru/tokens/css';\n");
    const result = writeCssImports(file, [
      "@import '@hareru/tokens/css';",
      "@import '@hareru/ui/styles/components/Button.css';",
    ]);
    expect(result.added).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]).toContain('@hareru/tokens/css');
  });

  it('all duplicates results in no changes', () => {
    const original =
      "@import '@hareru/tokens/css';\n@import '@hareru/ui/styles/components/Button.css';\n";
    const file = createFile('test.css', original);
    const result = writeCssImports(file, [
      "@import '@hareru/tokens/css';",
      "@import '@hareru/ui/styles/components/Button.css';",
    ]);
    expect(result.added).toHaveLength(0);
    expect(result.skipped).toHaveLength(2);
  });

  it('handles @layer declaration in tailwind mode', () => {
    const file = createFile('test.css', '');
    const result = writeCssImports(file, [
      '@layer theme, base, hui, components, utilities;',
      "@import 'tailwindcss';",
      "@import '@hareru/tokens/css';",
      "@import '@hareru/ui/styles/components.layer.css';",
    ]);
    expect(result.added).toHaveLength(4);
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const layerIdx = lines.findIndex((l) => l.startsWith('@layer'));
    const importIdx = lines.findIndex((l) => l.startsWith('@import'));
    expect(layerIdx).toBeLessThan(importIdx);
  });

  it('skips existing @layer declaration', () => {
    const file = createFile('test.css', '@layer theme, base, hui, components, utilities;\n');
    const result = writeCssImports(file, [
      '@layer theme, base, hui, components, utilities;',
      "@import '@hareru/tokens/css';",
    ]);
    expect(result.skipped).toContain('@layer theme, base, hui, components, utilities;');
    expect(result.added).toHaveLength(1);
  });

  it('adds scope.css import', () => {
    const file = createFile('test.css', "@import '@hareru/tokens/css';\n");
    const result = writeCssImports(file, ["@import '@hareru/ui/styles/scope.css';"]);
    expect(result.added).toHaveLength(1);
    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('scope.css');
  });

  it('adds baseline.css import', () => {
    const file = createFile('test.css', "@import '@hareru/tokens/css';\n");
    const result = writeCssImports(file, ["@import '@hareru/ui/styles/baseline.css';"]);
    expect(result.added).toHaveLength(1);
    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('baseline.css');
  });

  it('handles multiple sequential writes', () => {
    const file = createFile('test.css', '');
    writeCssImports(file, ["@import '@hareru/tokens/css';"]);
    const result = writeCssImports(file, ["@import '@hareru/ui/styles/components/Button.css';"]);
    expect(result.added).toHaveLength(1);
    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('@hareru/tokens/css');
    expect(content).toContain('Button.css');
  });

  it('preserves existing file content after imports', () => {
    const file = createFile('test.css', 'body {\n  margin: 0;\n}\n');
    writeCssImports(file, ["@import '@hareru/tokens/css';"]);
    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('body {');
    expect(content).toContain('margin: 0');
  });
});
