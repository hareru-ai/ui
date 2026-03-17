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

describe('hareru init', () => {
  let testDir: string;
  let origCwd: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `hareru-init-${Date.now()}`);
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    origCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    rmSync(testDir, { recursive: true, force: true });
  });

  // Helper to set up a basic project
  function setupProject(
    opts: {
      deps?: Record<string, string>;
      devDeps?: Record<string, string>;
      cssFile?: string;
      cssContent?: string;
    } = {},
  ) {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-app',
        dependencies: opts.deps ?? {},
        devDependencies: opts.devDeps ?? {},
      }),
    );
    const cssPath = opts.cssFile ?? 'src/app/globals.css';
    const fullPath = join(testDir, cssPath);
    mkdirSync(join(fullPath, '..'), { recursive: true });
    writeFileSync(fullPath, opts.cssContent ?? '');
    return fullPath;
  }

  // --- Dry-run tests ---
  it('shows dry-run preview for standalone mode', () => {
    setupProject();
    const { stdout, exitCode } = runCommand('init', '--mode', 'standalone');
    expect(exitCode).toBeUndefined();
    expect(stdout).toContain('hareru init');
    expect(stdout).toContain('standalone');
    expect(stdout).toContain('Managed block');
    expect(stdout).toContain("@import '@hareru/ui/styles.css'");
    expect(stdout).toContain('--write');
  });

  it('shows dry-run preview for portable mode', () => {
    setupProject();
    const { stdout } = runCommand('init', '--mode', 'portable');
    expect(stdout).toContain('portable');
    expect(stdout).toContain("@import '@hareru/tokens/css'");
    expect(stdout).toContain("@import '@hareru/ui/styles/components.css'");
  });

  it('shows dry-run preview for tailwind mode', () => {
    setupProject();
    const { stdout } = runCommand('init', '--mode', 'tailwind');
    expect(stdout).toContain('tailwind');
    expect(stdout).toContain('@layer theme, base, hui, components, utilities');
    // tailwindcss import should NOT be in managed block
    expect(stdout).not.toContain("@import 'tailwindcss'");
  });

  // --- --write tests ---
  it('--write creates CSS with managed block + hareru.json', () => {
    const cssFile = setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
    });
    const { stdout, exitCode } = runCommand('init', '--mode', 'standalone', '--write');
    expect(exitCode).toBeUndefined();
    expect(stdout).toContain('Wrote managed block');

    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain(MARKER_START);
    expect(content).toContain(MARKER_END);
    expect(content).toContain("@import '@hareru/ui/styles.css'");

    // hareru.json should exist
    expect(existsSync(join(testDir, 'hareru.json'))).toBe(true);
    const config = JSON.parse(readFileSync(join(testDir, 'hareru.json'), 'utf-8'));
    expect(config.mode).toBe('standalone');
  });

  it('--force overwrites existing managed block', () => {
    const cssFile = setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
      cssContent: `${MARKER_START}\n@import 'old';\n${MARKER_END}\n`,
    });

    const { stdout } = runCommand('init', '--mode', 'portable', '--write', '--force');
    expect(stdout).toContain('replaced existing block');

    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain("@import '@hareru/tokens/css'");
    expect(content).not.toContain("@import 'old'");
  });

  it('--force handles migration error case', () => {
    const cssFile = setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
      cssContent: "@layer theme, base, hui, components;\n@import '@hareru/tokens/css';\nbody {}\n",
    });

    const { stdout, exitCode } = runCommand('init', '--mode', 'tailwind', '--write', '--force');
    expect(exitCode).toBeUndefined();

    const content = readFileSync(cssFile, 'utf-8');
    // Old @layer hui should be removed
    expect(content).not.toContain('@layer theme, base, hui, components;');
    expect(content).toContain(MARKER_START);
    expect(content).toContain('body {}');
  });

  it('--write --css-file with nonexistent parent directory shows error', () => {
    setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
    });
    const { stderr, exitCode } = runCommand(
      'init',
      '--mode',
      'standalone',
      '--write',
      '--css-file',
      'does/not/exist.css',
    );
    expect(exitCode).toBe(1);
    expect(stderr).toContain('File not found');
  });

  it('--force adopts unmanaged imports even when block exists', () => {
    const cssFile = setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
      cssContent: [
        MARKER_START,
        "@import '@hareru/ui/styles.css';",
        MARKER_END,
        "@import '@hareru/ui/styles/components/Button.css';",
        'body {}',
      ].join('\n'),
    });

    runCommand('init', '--mode', 'standalone', '--write', '--force');

    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain(MARKER_START);
    // Unmanaged Button.css import should be adopted (removed from outside block)
    const lines = content.split('\n');
    const blockEnd = lines.indexOf(MARKER_END);
    const afterBlock = lines.slice(blockEnd + 1).join('\n');
    expect(afterBlock).not.toContain('Button.css');
  });

  // --- Mode validation ---
  it('--mode per-component shows error', () => {
    setupProject();
    const { stderr, exitCode } = runCommand('init', '--mode', 'per-component');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('per-component mode is not supported with init');
  });

  it('invalid --mode value shows error', () => {
    setupProject();
    const { stderr, exitCode } = runCommand('init', '--mode', 'badvalue');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Invalid mode');
  });

  // --- JSON output ---
  it('--json outputs structured result', () => {
    setupProject();
    const { stdout } = runCommand('init', '--mode', 'standalone', '--json');
    const data = JSON.parse(stdout);
    expect(data.mode).toBe('standalone');
    expect(data.managedImports).toBeDefined();
    expect(data.action).toBe('dry-run');
  });

  it('--json --write outputs JSON with write results', () => {
    setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
    });
    const { stdout, exitCode } = runCommand('init', '--mode', 'standalone', '--write', '--json');
    expect(exitCode).toBeUndefined();
    const data = JSON.parse(stdout);
    expect(data.action).toBe('create');
    expect(data.added).toBeDefined();
    expect(data.added.length).toBeGreaterThan(0);
    expect(data.configWritten).toBe(true);
  });

  it('--json --write reports configWritten: false when config exists without --force', () => {
    setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
    });
    writeFileSync(join(testDir, 'hareru.json'), '{}');

    const { stdout } = runCommand('init', '--mode', 'standalone', '--write', '--json');
    const data = JSON.parse(stdout);
    expect(data.configWritten).toBe(false);
  });

  // --- Framework detection ---
  it('detects Next.js framework', () => {
    setupProject({ deps: { next: '^14.0.0' } });
    const { stdout } = runCommand('init', '--mode', 'standalone');
    expect(stdout).toContain('next');
  });

  // --- Existing config ---
  it('warns when hareru.json exists without --force', () => {
    setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
    });
    writeFileSync(join(testDir, 'hareru.json'), '{}');

    const { stdout } = runCommand('init', '--mode', 'standalone', '--write');
    expect(stdout).toContain('hareru.json already exists');
  });

  // --- Existing managed block ---
  it('skips when managed block exists without --force', () => {
    setupProject({
      cssContent: `${MARKER_START}\n@import 'existing';\n${MARKER_END}\n`,
    });

    const { stdout } = runCommand('init', '--mode', 'standalone');
    expect(stdout).toContain('already exists');
  });

  // --- Auto-adopt ---
  it('auto-adopts existing @hareru/ imports', () => {
    const cssFile = setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
      cssContent: "@import '@hareru/tokens/css';\n@import '@hareru/ui/styles.css';\nbody {}\n",
    });

    const { stdout } = runCommand('init', '--mode', 'standalone', '--write');
    expect(stdout).toContain('Adopted');

    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain(MARKER_START);
    // Old standalone imports should be inside managed block, not outside
    const lines = content.split('\n');
    const blockEnd = lines.indexOf(MARKER_END);
    const afterBlock = lines.slice(blockEnd + 1).join('\n');
    expect(afterBlock).not.toContain("@import '@hareru/tokens/css'");
  });

  // --- Migration error ---
  it('shows migration error for @layer hui + @hareru/ imports', () => {
    setupProject({
      cssContent: "@layer theme, base, hui, components;\n@import '@hareru/tokens/css';\nbody {}\n",
    });

    const { stderr, exitCode } = runCommand('init', '--mode', 'tailwind');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Existing Tailwind + Hareru setup detected');
    expect(stderr).toContain('--force');
  });

  // --- Deps ---
  it('writes and warns when deps not installed', () => {
    setupProject(); // No @hareru deps
    const { stdout } = runCommand('init', '--mode', 'standalone', '--write');
    expect(stdout).toContain('Dependencies not installed');

    // Should still write the managed block
    const cssFile = join(testDir, 'src', 'app', 'globals.css');
    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain(MARKER_START);
  });

  // --- package.json errors ---
  it('errors when no package.json exists', () => {
    // Don't create package.json
    const { stderr, exitCode } = runCommand('init', '--mode', 'standalone');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('No package.json found');
  });

  it('errors when package.json has parse error', () => {
    writeFileSync(join(testDir, 'package.json'), '{bad json');
    const { stderr, exitCode } = runCommand('init', '--mode', 'standalone');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Failed to parse');
  });

  // --- Tailwind validation ---
  it('tailwind mode: warns when tailwindcss import not found', () => {
    setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
      cssContent: '',
    });

    const { stdout } = runCommand('init', '--mode', 'tailwind', '--write');
    expect(stdout).toContain("@import 'tailwindcss' not found");
  });

  it('tailwind mode: managed block does not contain @import tailwindcss', () => {
    const cssFile = setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
      cssContent: "@import 'tailwindcss';\n",
    });

    runCommand('init', '--mode', 'tailwind', '--write');

    const content = readFileSync(cssFile, 'utf-8');
    // Find managed block content
    const lines = content.split('\n');
    const startIdx = lines.indexOf(MARKER_START);
    const endIdx = lines.indexOf(MARKER_END);
    const blockContent = lines.slice(startIdx, endIdx + 1).join('\n');

    // tailwindcss import should NOT be inside managed block
    expect(blockContent).not.toContain("@import 'tailwindcss'");
    // But should still exist in the file (outside block)
    expect(content).toContain("@import 'tailwindcss'");
  });

  // --- Block placement ---
  it('managed block is placed at file start', () => {
    const cssFile = setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
      cssContent: 'body { color: red; }\n',
    });

    runCommand('init', '--mode', 'standalone', '--write');

    const content = readFileSync(cssFile, 'utf-8');
    expect(content.indexOf(MARKER_START)).toBe(0);
  });

  it('managed block is placed after @charset', () => {
    const cssFile = setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
      cssContent: "@charset 'utf-8';\nbody { color: red; }\n",
    });

    runCommand('init', '--mode', 'standalone', '--write');

    const content = readFileSync(cssFile, 'utf-8');
    const lines = content.split('\n');
    expect(lines[0]).toContain('@charset');
    expect(lines[1]).toBe(MARKER_START);
  });

  // --- --css-file resolution ---
  it('--css-file resolves from cwd', () => {
    setupProject({
      deps: { '@hareru/tokens': '1.0.0', '@hareru/ui': '1.0.0' },
    });
    const cssFile = join(testDir, 'custom', 'styles.css');
    mkdirSync(join(testDir, 'custom'), { recursive: true });
    writeFileSync(cssFile, '');

    runCommand('init', '--mode', 'standalone', '--write', '--css-file', 'custom/styles.css');

    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain(MARKER_START);
  });

  it('auto-detect uses configDir as base', () => {
    writeFileSync(join(testDir, 'package.json'), JSON.stringify({ name: 'test' }));
    // Create CSS file relative to package.json dir
    writeFileSync(join(testDir, 'src', 'app', 'globals.css'), '');
    // cd into subdir
    const subDir = join(testDir, 'src');
    process.chdir(subDir);

    const { stdout } = runCommand('init', '--mode', 'standalone');
    // Should still find globals.css via configDir-based detection
    expect(stdout).toContain('globals.css');
  });
});
