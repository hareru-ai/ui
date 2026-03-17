import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  MARKER_END,
  MARKER_START,
  findLayerHuiDeclarations,
  findManagedBlock,
  findTailwindImport,
  findUnmanagedHareruImports,
  replaceManagedBlock,
  writeManagedBlock,
} from '../utils/css-block.js';

describe('findManagedBlock', () => {
  it('finds a managed block', () => {
    const content = [
      MARKER_START,
      "@import '@hareru/tokens/css';",
      MARKER_END,
      '',
      'body { color: red; }',
    ].join('\n');

    const result = findManagedBlock(content);
    expect(result).not.toBeNull();
    expect(result?.startLine).toBe(0);
    expect(result?.endLine).toBe(2);
    expect(result?.lines).toHaveLength(3);
  });

  it('returns null when no markers found', () => {
    const content = "@import '@hareru/tokens/css';\nbody { color: red; }";
    expect(findManagedBlock(content)).toBeNull();
  });

  it('returns null when only start marker found', () => {
    const content = `${MARKER_START}\n@import '@hareru/tokens/css';`;
    expect(findManagedBlock(content)).toBeNull();
  });
});

describe('findUnmanagedHareruImports', () => {
  it('finds imports outside managed block', () => {
    const content = [
      MARKER_START,
      "@import '@hareru/tokens/css';",
      MARKER_END,
      "@import '@hareru/ui/styles/components/Button.css';",
    ].join('\n');

    const result = findUnmanagedHareruImports(content);
    expect(result).toHaveLength(1);
    expect(result[0].text).toContain('Button.css');
    expect(result[0].index).toBe(3);
  });

  it('ignores single-line commented-out @hareru/ imports', () => {
    const content = "/* @import '@hareru/ui/styles.css'; */\n@import '@hareru/tokens/css';";
    const result = findUnmanagedHareruImports(content);
    expect(result).toHaveLength(1);
    expect(result[0].text).toContain('tokens/css');
  });

  it('finds import after inline block comment on same line', () => {
    const content = "/* note */ @import '@hareru/ui/styles.css';";
    const result = findUnmanagedHareruImports(content);
    expect(result).toHaveLength(1);
    expect(result[0].text).toContain('styles.css');
  });

  it('ignores import fully inside inline block comment', () => {
    const content = "/* @import '@hareru/ui/styles.css'; */";
    const result = findUnmanagedHareruImports(content);
    expect(result).toHaveLength(0);
  });

  it('ignores imports in inline-opened multiline comments', () => {
    const content = [
      'body {} /*',
      "@import '@hareru/ui/styles.css';",
      '*/',
      "@import '@hareru/tokens/css';",
    ].join('\n');
    const result = findUnmanagedHareruImports(content);
    expect(result).toHaveLength(1);
    expect(result[0].text).toContain('tokens/css');
  });

  it('keeps @import before inline comment on same line', () => {
    const content = "@import '@hareru/ui/styles.css'; /* note */\n";
    const result = findUnmanagedHareruImports(content);
    expect(result).toHaveLength(1);
    expect(result[0].text).toContain('styles.css');
  });

  it('ignores multiline commented-out @hareru/ imports', () => {
    const content = [
      '/*',
      "@import '@hareru/ui/styles.css';",
      '*/',
      "@import '@hareru/tokens/css';",
    ].join('\n');
    const result = findUnmanagedHareruImports(content);
    expect(result).toHaveLength(1);
    expect(result[0].text).toContain('tokens/css');
  });

  it('does not find imports inside managed block', () => {
    const content = [
      MARKER_START,
      "@import '@hareru/tokens/css';",
      "@import '@hareru/ui/styles.css';",
      MARKER_END,
    ].join('\n');

    const result = findUnmanagedHareruImports(content);
    expect(result).toHaveLength(0);
  });

  it('finds imports when no managed block exists', () => {
    const content = "@import '@hareru/tokens/css';\n@import '@hareru/ui/styles.css';";
    const result = findUnmanagedHareruImports(content);
    expect(result).toHaveLength(2);
  });
});

describe('findLayerHuiDeclarations', () => {
  it('finds @layer with hui', () => {
    const content = '@layer theme, base, hui, components, utilities;\nbody {}';
    const result = findLayerHuiDeclarations(content);
    expect(result).toHaveLength(1);
    expect(result[0].index).toBe(0);
  });

  it('does not match @layer without hui', () => {
    const content = '@layer theme, base, components;\nbody {}';
    const result = findLayerHuiDeclarations(content);
    expect(result).toHaveLength(0);
  });

  it('finds multiple @layer declarations with hui', () => {
    const content = '@layer hui;\n@layer base, hui, utilities;\nbody {}';
    const result = findLayerHuiDeclarations(content);
    expect(result).toHaveLength(2);
  });

  it('matches @layer with leading whitespace', () => {
    const content = '  @layer theme, base, hui, components;\nbody {}';
    const result = findLayerHuiDeclarations(content);
    expect(result).toHaveLength(1);
  });

  it('ignores @layer hui inside managed block', () => {
    const content = [
      MARKER_START,
      '@layer theme, base, hui, components, utilities;',
      MARKER_END,
    ].join('\n');

    const result = findLayerHuiDeclarations(content);
    expect(result).toHaveLength(0);
  });
});

describe('findTailwindImport', () => {
  it('finds @import "tailwindcss"', () => {
    const content = "@import 'tailwindcss';\nbody {}";
    const result = findTailwindImport(content);
    expect(result).not.toBeNull();
    expect(result?.index).toBe(0);
  });

  it('finds with double quotes', () => {
    const content = '@import "tailwindcss";\nbody {}';
    const result = findTailwindImport(content);
    expect(result).not.toBeNull();
  });

  it('finds with leading whitespace', () => {
    const content = "  @import 'tailwindcss';\nbody {}";
    const result = findTailwindImport(content);
    expect(result).not.toBeNull();
  });

  it('returns null when not found', () => {
    const content = "@import '@hareru/tokens/css';\nbody {}";
    expect(findTailwindImport(content)).toBeNull();
  });
});

describe('writeManagedBlock', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `hareru-block-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('writes block to empty file', () => {
    const cssFile = join(testDir, 'styles.css');
    writeFileSync(cssFile, '');

    const result = writeManagedBlock(cssFile, [
      "@import '@hareru/tokens/css';",
      "@import '@hareru/ui/styles.css';",
    ]);

    expect(result.added).toHaveLength(2);
    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain(MARKER_START);
    expect(content).toContain(MARKER_END);
    expect(content).toContain("@import '@hareru/tokens/css';");
  });

  it('writes block at file start', () => {
    const cssFile = join(testDir, 'styles.css');
    writeFileSync(cssFile, 'body { color: red; }\n');

    writeManagedBlock(cssFile, ["@import '@hareru/ui/styles.css';"]);

    const content = readFileSync(cssFile, 'utf-8');
    const startIdx = content.indexOf(MARKER_START);
    const bodyIdx = content.indexOf('body');
    expect(startIdx).toBeLessThan(bodyIdx);
  });

  it('writes block after @charset', () => {
    const cssFile = join(testDir, 'styles.css');
    writeFileSync(cssFile, "@charset 'utf-8';\nbody { color: red; }\n");

    writeManagedBlock(cssFile, ["@import '@hareru/ui/styles.css';"]);

    const content = readFileSync(cssFile, 'utf-8');
    const lines = content.split('\n');
    expect(lines[0]).toContain('@charset');
    expect(lines[1]).toBe(MARKER_START);
  });

  it('skips when block exists and no force', () => {
    const cssFile = join(testDir, 'styles.css');
    writeFileSync(cssFile, `${MARKER_START}\n@import '@hareru/tokens/css';\n${MARKER_END}\n`);

    const result = writeManagedBlock(cssFile, ["@import '@hareru/ui/styles.css';"]);

    expect(result.added).toHaveLength(0);
    expect(result.replaced).toBe(false);
  });

  it('replaces block with --force', () => {
    const cssFile = join(testDir, 'styles.css');
    writeFileSync(
      cssFile,
      `${MARKER_START}\n@import '@hareru/tokens/css';\n${MARKER_END}\nbody {}\n`,
    );

    const result = writeManagedBlock(cssFile, ["@import '@hareru/ui/styles.css';"], {
      force: true,
    });

    expect(result.replaced).toBe(true);
    expect(result.added).toHaveLength(1);
    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain("@import '@hareru/ui/styles.css';");
    expect(content).not.toContain("@import '@hareru/tokens/css';");
    expect(content).toContain('body {}');
  });

  it('adopts existing imports', () => {
    const cssFile = join(testDir, 'styles.css');
    writeFileSync(
      cssFile,
      "@import '@hareru/tokens/css';\n@import '@hareru/ui/styles.css';\nbody {}\n",
    );

    const result = writeManagedBlock(
      cssFile,
      ["@import '@hareru/tokens/css';", "@import '@hareru/ui/styles.css';"],
      {
        adoptLines: [
          { index: 0, text: "@import '@hareru/tokens/css';" },
          { index: 1, text: "@import '@hareru/ui/styles.css';" },
        ],
      },
    );

    expect(result.adopted).toHaveLength(2);
    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain(MARKER_START);
    expect(content).toContain(MARKER_END);
    // Old standalone imports should be gone, only inside block
    const lines = content.split('\n');
    const blockStart = lines.indexOf(MARKER_START);
    const blockEnd = lines.indexOf(MARKER_END);
    const outsideLines = [...lines.slice(0, blockStart), ...lines.slice(blockEnd + 1)].join('\n');
    expect(outsideLines).not.toContain("@import '@hareru/tokens/css'");
  });

  it('force removes @layer hui declarations', () => {
    const cssFile = join(testDir, 'styles.css');
    writeFileSync(
      cssFile,
      "@layer theme, base, hui, components;\n@import '@hareru/tokens/css';\nbody {}\n",
    );

    writeManagedBlock(
      cssFile,
      ['@layer theme, base, hui, components, utilities;', "@import '@hareru/tokens/css';"],
      {
        force: true,
        adoptLines: [{ index: 1, text: "@import '@hareru/tokens/css';" }],
        removeLayerHui: [{ index: 0, text: '@layer theme, base, hui, components;' }],
      },
    );

    const content = readFileSync(cssFile, 'utf-8');
    // Old @layer should be removed
    expect(content).not.toContain('@layer theme, base, hui, components;');
    // New @layer inside block should exist
    expect(content).toContain('@layer theme, base, hui, components, utilities;');
    expect(content).toContain('body {}');
  });

  it('creates file if it does not exist', () => {
    const cssFile = join(testDir, 'nonexistent.css');

    const result = writeManagedBlock(cssFile, ["@import '@hareru/tokens/css';"]);

    expect(result.added).toHaveLength(1);
    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain(MARKER_START);
  });
});

describe('replaceManagedBlock', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `hareru-replace-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('replaces block content', () => {
    const cssFile = join(testDir, 'styles.css');
    writeFileSync(
      cssFile,
      `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\nbody {}\n`,
    );

    const result = replaceManagedBlock(cssFile, [
      "@import '@hareru/tokens/css';",
      "@import '@hareru/ui/styles/components.css';",
    ]);

    expect(result.removed).toHaveLength(1);
    expect(result.added).toHaveLength(2);
    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain("@import '@hareru/tokens/css';");
    expect(content).toContain('components.css');
    expect(content).not.toContain("@import '@hareru/ui/styles.css';");
    expect(content).toContain('body {}');
  });

  it('throws when no managed block exists', () => {
    const cssFile = join(testDir, 'styles.css');
    writeFileSync(cssFile, 'body {}\n');

    expect(() => replaceManagedBlock(cssFile, ["@import '@hareru/tokens/css';"])).toThrow(
      'No managed block found',
    );
  });
});
