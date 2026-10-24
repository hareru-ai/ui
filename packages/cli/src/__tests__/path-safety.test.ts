import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProgram } from '../index.js';
import { MARKER_END, MARKER_START } from '../utils/css-block.js';

const originalCss = `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\n`;

describe('CLI project boundary', () => {
  let fixture: string;
  let project: string;
  let outside: string;
  let cwd: string;

  beforeEach(() => {
    fixture = realpathSync(mkdtempSync(join(tmpdir(), 'hareru-path-safety-')));
    project = join(fixture, 'project');
    outside = join(fixture, 'project-elsewhere');
    mkdirSync(project);
    mkdirSync(outside);
    cwd = process.cwd();
    process.chdir(project);
    writeFileSync(
      join(project, 'package.json'),
      JSON.stringify({ dependencies: { '@hareru/ui': '*', '@hareru/tokens': '*' } }),
    );
    writeFileSync(join(project, 'index.css'), originalCss);
    writeFileSync(join(outside, 'index.css'), originalCss);
    writeFileSync(
      join(project, 'hareru.json'),
      JSON.stringify({ mode: 'standalone', cssFile: 'index.css' }),
    );
  });

  afterEach(() => {
    process.chdir(cwd);
    process.exitCode = undefined;
    vi.restoreAllMocks();
    rmSync(fixture, { recursive: true, force: true });
  });

  function run(...args: string[]): string {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const errors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...values: unknown[]) => {
      errors.push(values.join(' '));
    });
    createProgram()
      .exitOverride()
      .parse(['node', 'hareru', ...args]);
    return errors.join('\n');
  }

  const commands = [
    ['init', '--mode', 'portable', '--write', '--force'],
    ['add', 'Button', '--write', '--force'],
    ['update', '--mode', 'portable', '--write'],
  ];

  for (const args of commands) {
    it(`${args[0]} rejects an external CSS symlink, even with force`, () => {
      rmSync(join(project, 'index.css'));
      symlinkSync(join(outside, 'index.css'), join(project, 'index.css'));
      const configBefore = readFileSync(join(project, 'hareru.json'), 'utf8');

      expect(run(...args)).toContain('outside the project root');
      expect(process.exitCode).toBe(1);
      expect(readFileSync(join(outside, 'index.css'), 'utf8')).toBe(originalCss);
      expect(readFileSync(join(project, 'hareru.json'), 'utf8')).toBe(configBefore);
    });
  }

  for (const command of ['init', 'update']) {
    it(`${command} rejects an external config symlink before changing CSS`, () => {
      const config = readFileSync(join(project, 'hareru.json'), 'utf8');
      writeFileSync(join(outside, 'hareru.json'), config);
      rmSync(join(project, 'hareru.json'));
      symlinkSync(join(outside, 'hareru.json'), join(project, 'hareru.json'));
      const args = [command, '--mode', 'portable', '--write'];
      if (command === 'init') args.push('--force');

      expect(run(...args)).toContain('outside the project root');
      expect(process.exitCode).toBe(1);
      expect(readFileSync(join(project, 'index.css'), 'utf8')).toBe(originalCss);
      expect(readFileSync(join(outside, 'hareru.json'), 'utf8')).toBe(config);
    });
  }

  it('rejects a directory symlink when creating a new CSS file', () => {
    symlinkSync(outside, join(project, 'styles'), 'dir');
    expect(run('init', '--css-file', 'styles/new.css', '--write', '--force')).toContain(
      'outside the project root',
    );
    expect(process.exitCode).toBe(1);
    expect(existsSync(join(outside, 'new.css'))).toBe(false);
  });

  it('rejects a dangling CSS symlink instead of creating its external target', () => {
    symlinkSync(join(outside, 'new.css'), join(project, 'new.css'));
    expect(run('init', '--css-file', 'new.css', '--write', '--force')).toContain(
      'Cannot safely resolve',
    );
    expect(process.exitCode).toBe(1);
    expect(existsSync(join(outside, 'new.css'))).toBe(false);
  });

  it('rejects a dangling config symlink before changing CSS', () => {
    rmSync(join(project, 'hareru.json'));
    symlinkSync(join(outside, 'new.json'), join(project, 'hareru.json'));
    expect(run('init', '--mode', 'portable', '--write', '--force')).toContain(
      'Cannot safely resolve',
    );
    expect(process.exitCode).toBe(1);
    expect(readFileSync(join(project, 'index.css'), 'utf8')).toBe(originalCss);
    expect(existsSync(join(outside, 'new.json'))).toBe(false);
  });

  it('rejects an explicit CSS path outside the project even with force', () => {
    expect(
      run('add', 'Button', '--write', '--force', '--css-file', '../project-elsewhere/index.css'),
    ).toContain('outside the project root');
    expect(process.exitCode).toBe(1);
    expect(readFileSync(join(outside, 'index.css'), 'utf8')).toBe(originalCss);
  });

  it('allows CSS symlinks whose targets remain inside the project', () => {
    writeFileSync(join(project, 'actual.css'), originalCss);
    rmSync(join(project, 'index.css'));
    symlinkSync('actual.css', join(project, 'index.css'));
    expect(run('update', '--mode', 'portable', '--write')).toBe('');
    expect(process.exitCode).toBeUndefined();
    expect(readFileSync(join(project, 'actual.css'), 'utf8')).toContain('@hareru/tokens/css');
  });

  it('allows a new CSS file inside the project', () => {
    expect(run('init', '--css-file', 'new.css', '--write', '--force')).toBe('');
    expect(process.exitCode).toBeUndefined();
    expect(readFileSync(join(project, 'new.css'), 'utf8')).toContain(MARKER_START);
  });
});
