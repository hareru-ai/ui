import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProgram } from '../index.js';
import { MARKER_END, MARKER_START } from '../utils/css-block.js';

// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape stripping requires control chars
const ANSI_RE = /\x1b\[[0-9;]*m/g;
function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, '');
}

function runCommand(...args: string[]): {
  stdout: string;
  stderr: string;
  exitCode: number | undefined;
} {
  const logs: string[] = [];
  const errs: string[] = [];
  const spy = vi.spyOn(console, 'log').mockImplementation((...a) => logs.push(a.join(' ')));
  const errSpy = vi.spyOn(console, 'error').mockImplementation((...a) => errs.push(a.join(' ')));

  const program = createProgram();
  program.exitOverride();

  let exitCode: number | undefined;
  try {
    program.parse(['node', 'hareru', ...args]);
    exitCode = process.exitCode as number | undefined;
  } catch (e: unknown) {
    exitCode = (e as { exitCode?: number }).exitCode ?? 1;
  }

  spy.mockRestore();
  errSpy.mockRestore();
  process.exitCode = undefined;

  return { stdout: stripAnsi(logs.join('\n')), stderr: stripAnsi(errs.join('\n')), exitCode };
}

describe('hareru update', () => {
  let testDir: string;
  let origCwd: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `hareru-update-${Date.now()}`);
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    origCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    rmSync(testDir, { recursive: true, force: true });
  });

  function setupProject(opts: {
    mode: string;
    cssContent: string;
    cssFile?: string;
  }) {
    writeFileSync(join(testDir, 'package.json'), JSON.stringify({ name: 'test-app' }));
    const cssRelative = opts.cssFile ?? 'src/app/globals.css';
    const cssPath = join(testDir, cssRelative);
    mkdirSync(join(cssPath, '..'), { recursive: true });
    writeFileSync(cssPath, opts.cssContent);
    writeFileSync(
      join(testDir, 'hareru.json'),
      JSON.stringify({
        mode: opts.mode,
        cssFile: cssRelative,
      }),
    );
    return cssPath;
  }

  // --- Error cases ---
  it('errors when no hareru.json exists', () => {
    writeFileSync(join(testDir, 'package.json'), '{}');
    const { stderr, exitCode } = runCommand('update', '--mode', 'portable');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('No hareru.json found');
  });

  it('errors when hareru.json has invalid JSON', () => {
    writeFileSync(join(testDir, 'package.json'), '{}');
    writeFileSync(join(testDir, 'hareru.json'), '{bad json');
    const { stderr, exitCode } = runCommand('update', '--mode', 'portable');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Failed to parse');
  });

  it('errors when cssFile escapes project root', () => {
    writeFileSync(join(testDir, 'package.json'), '{}');
    writeFileSync(
      join(testDir, 'hareru.json'),
      JSON.stringify({ mode: 'standalone', cssFile: '../outside.css' }),
    );
    const { stderr, exitCode } = runCommand('update', '--mode', 'portable');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('resolves outside the project root');
  });

  it('errors when CSS file referenced in config does not exist', () => {
    writeFileSync(join(testDir, 'package.json'), '{}');
    writeFileSync(
      join(testDir, 'hareru.json'),
      JSON.stringify({
        mode: 'standalone',
        cssFile: 'nonexistent.css',
      }),
    );
    const { stderr, exitCode } = runCommand('update', '--mode', 'portable');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('CSS file not found');
  });

  it('errors when managed block not found', () => {
    setupProject({
      mode: 'standalone',
      cssContent: 'body {}\n',
    });
    const { stderr, exitCode } = runCommand('update', '--mode', 'portable');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('No managed block found');
  });

  it('errors with --mode per-component', () => {
    setupProject({
      mode: 'standalone',
      cssContent: `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\n`,
    });
    const { stderr, exitCode } = runCommand('update', '--mode', 'per-component');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('per-component mode is not supported');
  });

  // --- Dry-run ---
  it('shows mode change diff', () => {
    setupProject({
      mode: 'standalone',
      cssContent: `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\n`,
    });
    const { stdout, exitCode } = runCommand('update', '--mode', 'portable');
    expect(exitCode).toBeUndefined();
    expect(stdout).toContain('Current mode:');
    expect(stdout).toContain('standalone');
    expect(stdout).toContain('New mode:');
    expect(stdout).toContain('portable');
    expect(stdout).toContain('Remove:');
    expect(stdout).toContain('Add:');
    expect(stdout).toContain('--write');
  });

  // --- No change ---
  it('reports no changes when mode is the same', () => {
    setupProject({
      mode: 'standalone',
      cssContent: `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\n`,
    });
    const { stdout } = runCommand('update', '--mode', 'standalone');
    expect(stdout).toContain('No changes');
  });

  it('no-change still warns about missing tailwindcss import', () => {
    setupProject({
      mode: 'tailwind',
      cssContent: [
        MARKER_START,
        '@layer theme, base, hui, components, utilities;',
        "@import '@hareru/tokens/css';",
        "@import '@hareru/ui/styles/components.layer.css';",
        MARKER_END,
      ].join('\n'),
    });
    const { stdout } = runCommand('update', '--mode', 'tailwind', '--json');
    const data = JSON.parse(stdout);
    expect(data.status).toBe('no-change');
    expect(data.warnings.length).toBeGreaterThan(0);
    expect(data.warnings[0]).toContain("@import 'tailwindcss' not found");
  });

  // --- --write ---
  it('--write replaces managed block and updates config', () => {
    const cssFile = setupProject({
      mode: 'standalone',
      cssContent: `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\nbody {}\n`,
    });

    const { stdout, exitCode } = runCommand('update', '--mode', 'portable', '--write');
    expect(exitCode).toBeUndefined();
    expect(stdout).toContain('Updated');

    // CSS file should have new imports
    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain("@import '@hareru/tokens/css'");
    expect(content).toContain("@import '@hareru/ui/styles/components.css'");
    expect(content).not.toContain("@import '@hareru/ui/styles.css'");
    // User content preserved
    expect(content).toContain('body {}');

    // Config should be updated
    const config = JSON.parse(readFileSync(join(testDir, 'hareru.json'), 'utf-8'));
    expect(config.mode).toBe('portable');
  });

  // --- Unmanaged imports ---
  it('warns about unmanaged @hareru/ imports outside block', () => {
    setupProject({
      mode: 'standalone',
      cssContent: [
        MARKER_START,
        "@import '@hareru/ui/styles.css';",
        MARKER_END,
        "@import '@hareru/ui/styles/components/Button.css';",
      ].join('\n'),
    });

    const { stdout } = runCommand('update', '--mode', 'portable');
    expect(stdout).toContain('Unmanaged Hareru imports');
    expect(stdout).toContain('Button.css');
    expect(stdout).toContain('hareru init --write --force');
  });

  it('--write preserves unmanaged imports outside block', () => {
    const cssFile = setupProject({
      mode: 'standalone',
      cssContent: [
        MARKER_START,
        "@import '@hareru/ui/styles.css';",
        MARKER_END,
        "@import '@hareru/ui/styles/components/Button.css';",
      ].join('\n'),
    });

    runCommand('update', '--mode', 'portable', '--write');

    const content = readFileSync(cssFile, 'utf-8');
    // Unmanaged import should still be there
    expect(content).toContain("@import '@hareru/ui/styles/components/Button.css'");
    // Block should have new content
    expect(content).toContain("@import '@hareru/tokens/css'");
  });

  // --- Tailwind validation ---
  it('warns when switching to tailwind and tailwindcss import not found', () => {
    setupProject({
      mode: 'standalone',
      cssContent: `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\n`,
    });

    const { stdout } = runCommand('update', '--mode', 'tailwind');
    expect(stdout).toContain("@import 'tailwindcss' not found");
  });

  it('warns when tailwindcss import is before managed block', () => {
    setupProject({
      mode: 'standalone',
      cssContent: [
        "@import 'tailwindcss';",
        MARKER_START,
        "@import '@hareru/ui/styles.css';",
        MARKER_END,
      ].join('\n'),
    });

    const { stdout } = runCommand('update', '--mode', 'tailwind');
    expect(stdout).toContain('is before the managed block');
  });

  it('preserves @import tailwindcss outside block on --write', () => {
    const cssFile = setupProject({
      mode: 'standalone',
      cssContent: [
        MARKER_START,
        "@import '@hareru/ui/styles.css';",
        MARKER_END,
        "@import 'tailwindcss';",
      ].join('\n'),
    });

    runCommand('update', '--mode', 'tailwind', '--write');

    const content = readFileSync(cssFile, 'utf-8');
    // tailwindcss should remain outside
    expect(content).toContain("@import 'tailwindcss'");
    // Block should contain @layer and tokens
    const lines = content.split('\n');
    const blockStart = lines.indexOf(MARKER_START);
    const blockEnd = lines.indexOf(MARKER_END);
    const blockContent = lines.slice(blockStart, blockEnd + 1).join('\n');
    expect(blockContent).toContain('@layer theme, base, hui, components, utilities');
    expect(blockContent).not.toContain("@import 'tailwindcss'");
  });

  // --- JSON ---
  it('--json outputs structured result', () => {
    setupProject({
      mode: 'standalone',
      cssContent: `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\n`,
    });

    const { stdout } = runCommand('update', '--mode', 'portable', '--json');
    const data = JSON.parse(stdout);
    expect(data.currentMode).toBe('standalone');
    expect(data.newMode).toBe('portable');
    expect(data.action).toBe('dry-run');
    expect(data.removed).toBeDefined();
    expect(data.added).toBeDefined();
  });

  it('--json --write outputs JSON with applied status', () => {
    setupProject({
      mode: 'standalone',
      cssContent: `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\nbody {}\n`,
    });
    const { stdout, exitCode } = runCommand('update', '--mode', 'portable', '--write', '--json');
    expect(exitCode).toBeUndefined();
    const data = JSON.parse(stdout);
    expect(data.action).toBe('applied');
    expect(data.newMode).toBe('portable');
  });
});
