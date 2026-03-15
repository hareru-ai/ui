import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProgram } from '../index.js';

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

  return { stdout: logs.join('\n'), stderr: errs.join('\n'), exitCode };
}

describe('hareru add', () => {
  it('outputs per-component guide by default', () => {
    const { stdout } = runCommand('add', 'button');
    expect(stdout).toContain('CSS (per-component)');
    expect(stdout).toContain("@import '@hareru/tokens/css'");
    expect(stdout).toContain('@hareru/ui/styles/components/Button.css');
    expect(stdout).toContain('Import:');
  });

  it('outputs standalone guide', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'standalone');
    expect(stdout).toContain('CSS (standalone)');
    expect(stdout).toContain("@import '@hareru/ui/styles.css'");
  });

  it('outputs portable guide', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'portable');
    expect(stdout).toContain('CSS (portable)');
    expect(stdout).toContain("@import '@hareru/tokens/css'");
    expect(stdout).toContain("@import '@hareru/ui/styles/components.css'");
  });

  it('outputs tailwind guide', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'tailwind');
    expect(stdout).toContain('CSS (tailwind)');
    expect(stdout).toContain('@layer theme, base, hui, components, utilities');
    expect(stdout).toContain("@import 'tailwindcss'");
    expect(stdout).toContain('components.layer.css');
  });

  it('standalone --layer uses styles.layer.css', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'standalone', '--layer');
    expect(stdout).toContain('styles.layer.css');
  });

  it('portable --layer uses components.layer.css', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'portable', '--layer');
    expect(stdout).toContain('components.layer.css');
  });

  it('standalone --scope warns', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'standalone', '--scope');
    expect(stdout).toContain('Warning:');
    expect(stdout).toContain('not needed');
  });

  it('--baseline adds baseline.css in portable mode', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'portable', '--baseline');
    expect(stdout).toContain("@import '@hareru/ui/styles/baseline.css'");
  });

  it('--scope adds scope.css in portable mode', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'portable', '--scope');
    expect(stdout).toContain("@import '@hareru/ui/styles/scope.css'");
  });

  it('handles bundle add', () => {
    const { stdout } = runCommand('add', 'agent-chat-shell');
    expect(stdout).toContain("@import '@hareru/tokens/css'");
    expect(stdout).toContain('Import:');
  });

  it('not found shows error', () => {
    const { stderr, exitCode } = runCommand('add', 'nonexistent');
    expect(stderr).toContain('not found');
    expect(exitCode).toBe(1);
  });

  it('--json outputs JSON guide', () => {
    const { stdout } = runCommand('add', 'button', '--json');
    const data = JSON.parse(stdout);
    expect(data.name).toBe('Button');
    expect(data.type).toBe('component');
    expect(data.mode).toBe('per-component');
    expect(data.cssImports).toBeDefined();
    expect(data.jsImports).toBeDefined();
  });

  it('--json bundle outputs JSON guide', () => {
    const { stdout } = runCommand('add', 'agent-chat-shell', '--json');
    const data = JSON.parse(stdout);
    expect(data.name).toBe('agent-chat-shell');
    expect(data.type).toBe('bundle');
  });

  it('per-component --layer warns', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'per-component', '--layer');
    expect(stdout).toContain('Warning:');
    expect(stdout).toContain('no effect');
  });

  it('tailwind --layer warns about implicit', () => {
    const { stdout } = runCommand('add', 'button', '--mode', 'tailwind', '--layer');
    expect(stdout).toContain('Warning:');
    expect(stdout).toContain('implicit');
  });

  it('invalid --mode exits with error', () => {
    const { stderr, exitCode } = runCommand('add', 'button', '--mode', 'invalid');
    expect(stderr).toContain('Invalid mode');
    expect(exitCode).toBe(1);
  });
});

describe('hareru add --write', () => {
  let testDir: string;
  let origCwd: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `hareru-add-write-${Date.now()}`);
    mkdirSync(join(testDir, 'src'), { recursive: true });
    origCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    rmSync(testDir, { recursive: true, force: true });
  });

  it('--write with --force + --css-file writes imports', () => {
    const cssFile = join(testDir, 'src', 'index.css');
    writeFileSync(cssFile, '');
    const { stdout, exitCode } = runCommand(
      'add',
      'button',
      '--write',
      '--force',
      '--css-file',
      cssFile,
    );
    expect(exitCode).toBeUndefined(); // success (no exitCode set)
    expect(stdout).toContain('Added to');
    const content = readFileSync(cssFile, 'utf-8');
    expect(content).toContain("@import '@hareru/tokens/css'");
    expect(content).toContain('Button.css');
  });

  it('--write fails when no package.json exists', () => {
    const cssFile = join(testDir, 'src', 'index.css');
    writeFileSync(cssFile, '');
    const { stderr, exitCode } = runCommand('add', 'button', '--write', '--css-file', cssFile);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('No package.json found');
  });

  it('--write fails when dependencies are missing', () => {
    writeFileSync(join(testDir, 'package.json'), JSON.stringify({}));
    const cssFile = join(testDir, 'src', 'index.css');
    writeFileSync(cssFile, '');
    const { stderr, exitCode } = runCommand('add', 'button', '--write', '--css-file', cssFile);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Missing dependencies');
  });

  it('--write --force bypasses dependency check', () => {
    writeFileSync(join(testDir, 'package.json'), JSON.stringify({}));
    const cssFile = join(testDir, 'src', 'index.css');
    writeFileSync(cssFile, '');
    const { stdout, exitCode } = runCommand(
      'add',
      'button',
      '--write',
      '--force',
      '--css-file',
      cssFile,
    );
    expect(exitCode).toBeUndefined();
    expect(stdout).toContain('Added to');
  });

  it('--write fails with broken package.json', () => {
    writeFileSync(join(testDir, 'package.json'), '{invalid json');
    const cssFile = join(testDir, 'src', 'index.css');
    writeFileSync(cssFile, '');
    const { stderr, exitCode } = runCommand('add', 'button', '--write', '--css-file', cssFile);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Failed to parse');
  });

  it('--write --force bypasses broken package.json check', () => {
    writeFileSync(join(testDir, 'package.json'), '{invalid json');
    const cssFile = join(testDir, 'src', 'index.css');
    writeFileSync(cssFile, '');
    const { stdout, exitCode } = runCommand(
      'add',
      'button',
      '--write',
      '--force',
      '--css-file',
      cssFile,
    );
    expect(exitCode).toBeUndefined();
    expect(stdout).toContain('Added to');
  });

  it('--write fails when CSS file not found and no auto-detect', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        dependencies: { '@hareru/tokens': '^0.1.0', '@hareru/ui': '^0.1.0' },
      }),
    );
    // No CSS file in any candidate location
    const { stderr, exitCode } = runCommand('add', 'button', '--write');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Could not find a CSS file');
  });

  it('--write --css-file with nonexistent path reports ENOENT', () => {
    const bogusPath = join(testDir, 'does', 'not', 'exist.css');
    const { stderr, exitCode } = runCommand(
      'add',
      'button',
      '--write',
      '--force',
      '--css-file',
      bogusPath,
    );
    expect(exitCode).toBe(1);
    expect(stderr).toContain('File not found');
  });

  it('--write auto-detects src/index.css', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        dependencies: { '@hareru/tokens': '^0.1.0', '@hareru/ui': '^0.1.0' },
      }),
    );
    writeFileSync(join(testDir, 'src', 'index.css'), '');
    const { stdout, exitCode } = runCommand('add', 'button', '--write');
    expect(exitCode).toBeUndefined();
    expect(stdout).toContain('Added to');
    expect(stdout).toContain('src/index.css');
  });

  it('--write skips already-present imports', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        dependencies: { '@hareru/tokens': '^0.1.0', '@hareru/ui': '^0.1.0' },
      }),
    );
    const cssFile = join(testDir, 'src', 'index.css');
    writeFileSync(
      cssFile,
      "@import '@hareru/tokens/css';\n@import '@hareru/ui/styles/components/Button.css';\n",
    );
    const { stdout } = runCommand('add', 'button', '--write', '--css-file', cssFile);
    expect(stdout).toContain('All CSS imports already present');
  });

  it('--write --json outputs structured result', () => {
    const cssFile = join(testDir, 'src', 'index.css');
    writeFileSync(cssFile, '');
    const { stdout } = runCommand(
      'add',
      'button',
      '--write',
      '--force',
      '--json',
      '--css-file',
      cssFile,
    );
    const data = JSON.parse(stdout);
    expect(data.name).toBe('Button');
    expect(data.type).toBe('component');
    expect(data.added.length).toBeGreaterThan(0);
    expect(data.cssFile).toContain('index.css');
  });

  it('guide mode warns about broken package.json on stderr', () => {
    writeFileSync(join(testDir, 'package.json'), '{bad json');
    const { stdout, stderr } = runCommand('add', 'button');
    // Warning goes to stderr, not stdout
    expect(stderr).toContain('Warning:');
    expect(stderr).toContain('Failed to parse');
    // stdout still contains a valid guide
    expect(stdout).toContain('Install:');
    expect(stdout).toContain('CSS (per-component)');
  });

  it('--json with broken package.json emits valid JSON with parseError field', () => {
    writeFileSync(join(testDir, 'package.json'), '{bad json');
    const { stdout } = runCommand('add', 'button', '--json');
    const data = JSON.parse(stdout);
    expect(data.parseError).toBeDefined();
    expect(data.parseError).toContain('Failed to parse');
    expect(data.name).toBe('Button');
    expect(data.cssImports).toBeDefined();
  });
});
