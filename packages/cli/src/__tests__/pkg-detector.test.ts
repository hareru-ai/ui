import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectPackage } from '../utils/pkg-detector.js';

let testDir: string;

beforeEach(() => {
  testDir = join(tmpdir(), `hareru-pkg-detect-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });
});

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe('detectPackage', () => {
  it('returns found:false when no package.json exists', () => {
    const result = detectPackage(testDir);
    // temp dir may or may not find a parent package.json
    expect(result).toHaveProperty('packageManager');
  });

  it('detects npm as default package manager', () => {
    writeFileSync(join(testDir, 'package.json'), JSON.stringify({}));
    const result = detectPackage(testDir);
    expect(result.found).toBe(true);
    expect(result.packageManager).toBe('npm');
    expect(result.installCommand).toContain('npm install');
  });

  it('detects pnpm from colocated lockfile', () => {
    writeFileSync(join(testDir, 'package.json'), JSON.stringify({}));
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), '');
    const result = detectPackage(testDir);
    expect(result.packageManager).toBe('pnpm');
    expect(result.installCommand).toContain('pnpm add');
  });

  it('detects pnpm from ancestor lockfile (monorepo)', () => {
    // Simulate: testDir/pnpm-lock.yaml + testDir/packages/app/package.json
    writeFileSync(join(testDir, 'pnpm-lock.yaml'), '');
    const appDir = join(testDir, 'packages', 'app');
    mkdirSync(appDir, { recursive: true });
    writeFileSync(join(appDir, 'package.json'), JSON.stringify({}));
    const result = detectPackage(appDir);
    expect(result.found).toBe(true);
    expect(result.packageManager).toBe('pnpm');
    expect(result.installCommand).toContain('pnpm add');
  });

  it('detects yarn from ancestor lockfile (monorepo)', () => {
    writeFileSync(join(testDir, 'yarn.lock'), '');
    const appDir = join(testDir, 'packages', 'app');
    mkdirSync(appDir, { recursive: true });
    writeFileSync(join(appDir, 'package.json'), JSON.stringify({}));
    const result = detectPackage(appDir);
    expect(result.packageManager).toBe('yarn');
  });

  it('detects yarn from colocated lockfile', () => {
    writeFileSync(join(testDir, 'package.json'), JSON.stringify({}));
    writeFileSync(join(testDir, 'yarn.lock'), '');
    const result = detectPackage(testDir);
    expect(result.packageManager).toBe('yarn');
    expect(result.installCommand).toContain('yarn add');
  });

  it('detects bun from lockfile', () => {
    writeFileSync(join(testDir, 'package.json'), JSON.stringify({}));
    writeFileSync(join(testDir, 'bun.lockb'), '');
    const result = detectPackage(testDir);
    expect(result.packageManager).toBe('bun');
    expect(result.installCommand).toContain('bun add');
  });

  it('detects installed dependencies', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        dependencies: { '@hareru/tokens': '^0.1.0', '@hareru/ui': '^0.1.0' },
      }),
    );
    const result = detectPackage(testDir);
    expect(result.installed.tokens).toBe(true);
    expect(result.installed.ui).toBe(true);
    expect(result.installCommand).toBe('');
  });

  it('detects partially installed dependencies', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        dependencies: { '@hareru/tokens': '^0.1.0' },
      }),
    );
    const result = detectPackage(testDir);
    expect(result.installed.tokens).toBe(true);
    expect(result.installed.ui).toBe(false);
    expect(result.installCommand).toContain('@hareru/ui');
    expect(result.installCommand).not.toContain('@hareru/tokens');
  });

  it('detects devDependencies', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        devDependencies: { '@hareru/tokens': '^0.1.0', '@hareru/ui': '^0.1.0' },
      }),
    );
    const result = detectPackage(testDir);
    expect(result.installed.tokens).toBe(true);
    expect(result.installed.ui).toBe(true);
  });

  it('reports parseError for broken package.json', () => {
    writeFileSync(join(testDir, 'package.json'), '{invalid json!!!');
    const result = detectPackage(testDir);
    expect(result.found).toBe(true);
    expect(result.parseError).toBeDefined();
    expect(result.parseError).toContain('Failed to parse');
    expect(result.installed.tokens).toBe(false);
    expect(result.installed.ui).toBe(false);
  });

  it('does NOT treat peerDependencies as installed', () => {
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        peerDependencies: { '@hareru/tokens': '^0.1.0', '@hareru/ui': '^0.1.0' },
      }),
    );
    const result = detectPackage(testDir);
    expect(result.installed.tokens).toBe(false);
    expect(result.installed.ui).toBe(false);
    expect(result.installCommand).toContain('@hareru/tokens');
    expect(result.installCommand).toContain('@hareru/ui');
  });
});
