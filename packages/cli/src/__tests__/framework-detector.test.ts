import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectFramework } from '../utils/framework-detector.js';

describe('detectFramework', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `hareru-fw-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  function writePkgJson(deps: Record<string, string> = {}, devDeps: Record<string, string> = {}) {
    const pkgPath = join(testDir, 'package.json');
    writeFileSync(pkgPath, JSON.stringify({ dependencies: deps, devDependencies: devDeps }));
    return pkgPath;
  }

  it('detects Next.js', () => {
    const path = writePkgJson({ next: '^14.0.0', react: '^18.0.0' });
    const result = detectFramework(path);
    expect(result.framework).toBe('next');
  });

  it('detects Vite', () => {
    const path = writePkgJson({}, { vite: '^5.0.0' });
    const result = detectFramework(path);
    expect(result.framework).toBe('vite');
  });

  it('detects Remix', () => {
    const path = writePkgJson({ '@remix-run/react': '^2.0.0' });
    const result = detectFramework(path);
    expect(result.framework).toBe('remix');
  });

  it('detects Astro', () => {
    const path = writePkgJson({ astro: '^4.0.0' });
    const result = detectFramework(path);
    expect(result.framework).toBe('astro');
  });

  it('returns unknown for unrecognized project', () => {
    const path = writePkgJson({ express: '^4.0.0' });
    const result = detectFramework(path);
    expect(result.framework).toBe('unknown');
  });

  it('detects Tailwind CSS', () => {
    const path = writePkgJson({}, { tailwindcss: '^4.0.0' });
    const result = detectFramework(path);
    expect(result.hasTailwind).toBe(true);
  });

  it('no Tailwind when not present', () => {
    const path = writePkgJson({ react: '^18.0.0' });
    const result = detectFramework(path);
    expect(result.hasTailwind).toBe(false);
  });

  it('detects normalize.css as existing reset', () => {
    const path = writePkgJson({ 'normalize.css': '^8.0.0' });
    const result = detectFramework(path);
    expect(result.hasExistingReset).toBe(true);
  });

  it('detects bootstrap as existing reset', () => {
    const path = writePkgJson({ bootstrap: '^5.0.0' });
    const result = detectFramework(path);
    expect(result.hasExistingReset).toBe(true);
  });

  it('no reset when not present', () => {
    const path = writePkgJson({ react: '^18.0.0' });
    const result = detectFramework(path);
    expect(result.hasExistingReset).toBe(false);
  });

  it('handles invalid JSON gracefully', () => {
    const pkgPath = join(testDir, 'package.json');
    writeFileSync(pkgPath, '{bad json');
    const result = detectFramework(pkgPath);
    expect(result.framework).toBe('unknown');
    expect(result.hasTailwind).toBe(false);
    expect(result.hasExistingReset).toBe(false);
  });

  it('Next.js takes priority over Vite', () => {
    const path = writePkgJson({ next: '^14.0.0' }, { vite: '^5.0.0' });
    const result = detectFramework(path);
    expect(result.framework).toBe('next');
  });
});
