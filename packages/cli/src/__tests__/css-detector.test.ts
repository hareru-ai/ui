import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectCssFile } from '../utils/css-detector.js';

let testDir: string;

beforeEach(() => {
  testDir = join(tmpdir(), `hareru-css-detect-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });
});

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe('detectCssFile', () => {
  it('detects src/app/globals.css', () => {
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'app', 'globals.css'), '');
    expect(detectCssFile(testDir)).toBe(join(testDir, 'src', 'app', 'globals.css'));
  });

  it('detects src/index.css', () => {
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'index.css'), '');
    expect(detectCssFile(testDir)).toBe(join(testDir, 'src', 'index.css'));
  });

  it('prefers src/app/globals.css over src/index.css', () => {
    mkdirSync(join(testDir, 'src', 'app'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'app', 'globals.css'), '');
    writeFileSync(join(testDir, 'src', 'index.css'), '');
    expect(detectCssFile(testDir)).toBe(join(testDir, 'src', 'app', 'globals.css'));
  });

  it('detects styles/globals.css', () => {
    mkdirSync(join(testDir, 'styles'), { recursive: true });
    writeFileSync(join(testDir, 'styles', 'globals.css'), '');
    expect(detectCssFile(testDir)).toBe(join(testDir, 'styles', 'globals.css'));
  });

  it('returns null when no CSS file exists', () => {
    expect(detectCssFile(testDir)).toBeNull();
  });
});
