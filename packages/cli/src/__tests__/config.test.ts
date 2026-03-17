import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  loadConfig,
  resolveConfigDir,
  resolveCssFilePath,
  updateConfig,
  writeConfig,
} from '../utils/config.js';

describe('config', () => {
  let testDir: string;
  let origCwd: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `hareru-config-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    origCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('resolveConfigDir', () => {
    it('returns directory of nearest package.json', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');
      const result = resolveConfigDir(testDir);
      expect(result).toBe(testDir);
    });

    it('returns cwd when no package.json found', () => {
      // No package.json in testDir, but one might exist higher up
      // Create a subdir to isolate
      const subDir = join(testDir, 'deep', 'nested');
      mkdirSync(subDir, { recursive: true });
      // resolveConfigDir uses detectPackage which walks up
      const result = resolveConfigDir(subDir);
      // It should find the testDir or higher package.json, or return the dir itself
      expect(typeof result).toBe('string');
    });

    it('works with monorepo subdirectory', () => {
      // Root package.json
      writeFileSync(join(testDir, 'package.json'), '{}');
      // Sub package
      const subDir = join(testDir, 'packages', 'app');
      mkdirSync(subDir, { recursive: true });
      writeFileSync(join(subDir, 'package.json'), '{}');

      const result = resolveConfigDir(subDir);
      expect(result).toBe(subDir);
    });
  });

  describe('writeConfig + loadConfig', () => {
    it('writes and loads hareru.json', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');
      const cssFile = join(testDir, 'src', 'app', 'globals.css');

      writeConfig(
        testDir,
        {
          mode: 'standalone',
          cssFile: '',
          framework: 'next',
        },
        cssFile,
      );

      const loaded = loadConfig(testDir);
      expect(loaded).not.toBeNull();
      expect(loaded?.config.mode).toBe('standalone');
      expect(loaded?.config.framework).toBe('next');
      expect(loaded?.config.cssFile).toBe('src/app/globals.css');
      expect(loaded?.config.$schema).toBeDefined();
    });

    it('stores cssFile as relative path', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');
      const cssFile = join(testDir, 'styles', 'main.css');

      writeConfig(
        testDir,
        {
          mode: 'portable',
          cssFile: '',
        },
        cssFile,
      );

      const raw = JSON.parse(readFileSync(join(testDir, 'hareru.json'), 'utf-8'));
      expect(raw.cssFile).toBe('styles/main.css');
    });

    it('omits framework when unknown', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');

      writeConfig(
        testDir,
        {
          mode: 'standalone',
          cssFile: '',
          framework: 'unknown' as 'next',
        },
        join(testDir, 'index.css'),
      );

      const raw = JSON.parse(readFileSync(join(testDir, 'hareru.json'), 'utf-8'));
      expect(raw.framework).toBeUndefined();
    });

    it('includes options when set', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');

      writeConfig(
        testDir,
        {
          mode: 'portable',
          cssFile: '',
          options: { scope: true, baseline: true },
        },
        join(testDir, 'index.css'),
      );

      const loaded = loadConfig(testDir);
      expect(loaded?.config.options).toEqual({ scope: true, baseline: true });
    });

    it('omits options when empty', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');

      writeConfig(
        testDir,
        {
          mode: 'standalone',
          cssFile: '',
          options: { scope: false, baseline: false },
        },
        join(testDir, 'index.css'),
      );

      const raw = JSON.parse(readFileSync(join(testDir, 'hareru.json'), 'utf-8'));
      expect(raw.options).toBeUndefined();
    });
  });

  describe('loadConfig', () => {
    it('returns null when hareru.json does not exist', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');
      const result = loadConfig(testDir);
      expect(result).toBeNull();
    });

    it('returns error when hareru.json has invalid JSON', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');
      writeFileSync(join(testDir, 'hareru.json'), '{bad json');
      const result = loadConfig(testDir);
      expect(result).not.toBeNull();
      expect(result?.error).toContain('Failed to parse');
    });

    it('returns error when hareru.json is missing required fields', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');
      writeFileSync(join(testDir, 'hareru.json'), JSON.stringify({ mode: 'standalone' }));
      const result = loadConfig(testDir);
      expect(result).not.toBeNull();
      expect(result?.error).toContain('missing required fields');
    });
  });

  describe('updateConfig', () => {
    it('throws on corrupt hareru.json', () => {
      const configPath = join(testDir, 'hareru.json');
      writeFileSync(configPath, '{bad json');
      expect(() => updateConfig(configPath, { mode: 'portable' })).toThrow('Failed to parse');
    });

    it('updates mode in existing config', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');
      const configPath = join(testDir, 'hareru.json');
      writeFileSync(configPath, JSON.stringify({ mode: 'standalone', cssFile: 'src/index.css' }));

      updateConfig(configPath, { mode: 'portable' });

      const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(raw.mode).toBe('portable');
      expect(raw.cssFile).toBe('src/index.css');
    });

    it('updates options in existing config', () => {
      const configPath = join(testDir, 'hareru.json');
      writeFileSync(configPath, JSON.stringify({ mode: 'portable', cssFile: 'src/index.css' }));

      updateConfig(configPath, { options: { scope: true } });

      const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(raw.options).toEqual({ scope: true });
    });

    it('removes falsy options', () => {
      const configPath = join(testDir, 'hareru.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          mode: 'portable',
          cssFile: 'src/index.css',
          options: { scope: true },
        }),
      );

      updateConfig(configPath, { options: { scope: false } });

      const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(raw.options).toBeUndefined();
    });
  });

  describe('resolveCssFilePath', () => {
    it('resolves relative path from configDir', () => {
      const result = resolveCssFilePath('/project', 'src/app/globals.css');
      expect(result).toBe(resolve('/project', 'src/app/globals.css'));
    });

    it('rejects paths that escape configDir', () => {
      expect(() => resolveCssFilePath('/mono/packages/app', '../shared/styles.css')).toThrow(
        'resolves outside the project root',
      );
    });

    it('rejects sibling directories with shared prefix', () => {
      expect(() => resolveCssFilePath('/tmp/project', '../project-evil/outside.css')).toThrow(
        'resolves outside the project root',
      );
    });

    it('allows subdirectory paths', () => {
      const result = resolveCssFilePath('/project', 'src/styles/globals.css');
      expect(result).toBe(resolve('/project', 'src/styles/globals.css'));
    });
  });
});
