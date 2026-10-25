import {
  existsSync,
  linkSync,
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
import { updateConfig } from '../utils/config.js';
import { MARKER_END, MARKER_START } from '../utils/css-block.js';

const originalCss = `${MARKER_START}\n@import '@hareru/ui/styles.css';\n${MARKER_END}\n`;

describe('CLI project boundary', () => {
  let fixture: string;
  let project: string;
  let outside: string;
  let cwd: string;
  let stdout: string;

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
    const logs: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      logs.push(values.join(' '));
    });
    const errors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...values: unknown[]) => {
      errors.push(values.join(' '));
    });
    createProgram()
      .exitOverride()
      .parse(['node', 'hareru', ...args]);
    stdout = logs.join('\n');
    return errors.join('\n');
  }

  const commands = [
    ['init', '--mode', 'portable', '--write', '--force'],
    ['add', 'Button', '--write', '--force'],
    ['update', '--mode', 'portable', '--write'],
  ];

  for (const args of commands) {
    it(`${args[0]} rejects an external CSS hard link without truncating its target`, () => {
      rmSync(join(project, 'index.css'));
      linkSync(join(outside, 'index.css'), join(project, 'index.css'));
      const configBefore = readFileSync(join(project, 'hareru.json'), 'utf8');

      expect(run(...args)).toContain('hard links are not allowed');
      expect(process.exitCode).toBe(1);
      expect(readFileSync(join(outside, 'index.css'), 'utf8')).toBe(originalCss);
      expect(readFileSync(join(project, 'hareru.json'), 'utf8')).toBe(configBefore);
    });

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
    it(`${command} rejects a config hard link without truncating its target`, () => {
      const config = readFileSync(join(project, 'hareru.json'), 'utf8');
      writeFileSync(join(outside, 'hareru.json'), config);
      rmSync(join(project, 'hareru.json'));
      linkSync(join(outside, 'hareru.json'), join(project, 'hareru.json'));
      const args = [command, '--mode', 'portable', '--write'];
      if (command === 'init') args.push('--force');

      expect(run(...args)).toContain('hard links are not allowed');
      expect(process.exitCode).toBe(1);
      expect(readFileSync(join(outside, 'hareru.json'), 'utf8')).toBe(config);
      expect(readFileSync(join(project, 'index.css'), 'utf8')).toBe(originalCss);
    });

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

  it('init writes CSS and skips an existing config hard link without force', () => {
    const config = readFileSync(join(project, 'hareru.json'), 'utf8');
    writeFileSync(join(outside, 'hareru.json'), config);
    rmSync(join(project, 'hareru.json'));
    linkSync(join(outside, 'hareru.json'), join(project, 'hareru.json'));
    writeFileSync(join(project, 'index.css'), '/* Application styles */\n');

    expect(run('init', '--mode', 'portable', '--write', '--json')).toBe('');
    expect(process.exitCode).toBeUndefined();
    expect(JSON.parse(stdout).configWritten).toBe(false);
    expect(readFileSync(join(project, 'index.css'), 'utf8')).toContain('@hareru/tokens/css');
    expect(readFileSync(join(project, 'index.css'), 'utf8')).toContain(MARKER_START);
    expect(readFileSync(join(project, 'hareru.json'), 'utf8')).toBe(config);
    expect(readFileSync(join(outside, 'hareru.json'), 'utf8')).toBe(config);
  });

  it('init rejects a config directory before changing CSS', () => {
    rmSync(join(project, 'hareru.json'));
    mkdirSync(join(project, 'hareru.json'));

    expect(run('init', '--mode', 'portable', '--write', '--force')).toContain(
      'destination must be a regular file',
    );
    expect(process.exitCode).toBe(1);
    expect(readFileSync(join(project, 'index.css'), 'utf8')).toBe(originalCss);
  });

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

  it('rejects a config hard link even when update leaves CSS unchanged', () => {
    const config = readFileSync(join(project, 'hareru.json'), 'utf8');
    writeFileSync(join(outside, 'hareru.json'), config);
    rmSync(join(project, 'hareru.json'));
    linkSync(join(outside, 'hareru.json'), join(project, 'hareru.json'));

    expect(run('update', '--write')).toContain('hard links are not allowed');
    expect(process.exitCode).toBe(1);
    expect(readFileSync(join(outside, 'hareru.json'), 'utf8')).toBe(config);
    expect(readFileSync(join(project, 'index.css'), 'utf8')).toBe(originalCss);
  });

  it('checks updateConfig against the caller-provided root', () => {
    const configPath = join(outside, 'hareru.json');
    const config = JSON.stringify({ mode: 'standalone', cssFile: 'index.css' });
    writeFileSync(configPath, config);

    expect(() => updateConfig(project, configPath, { mode: 'portable' })).toThrow(
      'outside the project root',
    );
    expect(readFileSync(configPath, 'utf8')).toBe(config);
  });

  for (const args of commands) {
    for (const json of [false, true]) {
      it(`${args[0]} keeps a normalized CSS symlink path in ${json ? 'JSON' : 'text'} output and config`, () => {
        mkdirSync(join(project, 'src'));
        mkdirSync(join(project, 'themes'));
        const cssPath = join(project, 'src', 'globals.css');
        const target = join(project, 'themes', 'a.css');
        writeFileSync(target, originalCss);
        symlinkSync('../themes/a.css', cssPath);
        writeFileSync(
          join(project, 'hareru.json'),
          JSON.stringify({ mode: 'standalone', cssFile: 'src/globals.css' }),
        );
        const commandArgs = [...args];
        if (args[0] !== 'update') commandArgs.push('--css-file', 'src/../src/globals.css');
        if (json) commandArgs.push('--json');

        expect(run(...commandArgs)).toBe('');
        expect(process.exitCode).toBeUndefined();
        expect(JSON.parse(readFileSync(join(project, 'hareru.json'), 'utf8')).cssFile).toBe(
          'src/globals.css',
        );
        if (json) {
          expect(JSON.parse(stdout).cssFile).toBe(cssPath);
        } else {
          expect(stdout).toContain(cssPath);
        }
        expect(stdout).not.toContain(target);
        expect(readFileSync(target, 'utf8')).not.toBe(originalCss);
      });
    }
  }

  it('continues using the configured CSS symlink after its target changes', () => {
    mkdirSync(join(project, 'src'));
    mkdirSync(join(project, 'themes'));
    const cssPath = join(project, 'src', 'globals.css');
    const firstTarget = join(project, 'themes', 'a.css');
    const secondTarget = join(project, 'themes', 'b.css');
    writeFileSync(firstTarget, originalCss);
    writeFileSync(secondTarget, originalCss);
    symlinkSync('../themes/a.css', cssPath);
    expect(run('init', '--write', '--force', '--css-file', 'src/globals.css')).toBe('');
    const firstContent = readFileSync(firstTarget, 'utf8');

    rmSync(cssPath);
    symlinkSync('../themes/b.css', cssPath);
    expect(run('update', '--write', '--mode', 'portable')).toBe('');
    expect(process.exitCode).toBeUndefined();
    expect(readFileSync(firstTarget, 'utf8')).toBe(firstContent);
    expect(readFileSync(secondTarget, 'utf8')).toContain('@hareru/tokens/css');
  });
});
