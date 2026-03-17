import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape stripping requires control chars
const ANSI_RE = /\x1b\[[0-9;]*m/g;
function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, '');
}

function mockRegistry(thrower: () => never) {
  vi.doMock('@hareru/registry', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@hareru/registry')>();
    return { ...actual, loadRegistry: thrower };
  });
}

async function runList(): Promise<{ stderr: string }> {
  const { createProgram } = await import('../index.js');
  const errs: string[] = [];
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const errSpy = vi.spyOn(console, 'error').mockImplementation((...a) => errs.push(a.join(' ')));
  const program = createProgram();
  program.exitOverride();
  try {
    program.parse(['node', 'hareru', 'list']);
  } catch {
    /* commander exitOverride */
  }
  logSpy.mockRestore();
  errSpy.mockRestore();
  return { stderr: stripAnsi(errs.join('\n')) };
}

describe('hareru list — registry error', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.doUnmock('@hareru/registry');
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it('shows styled error and build hint when registry not found', async () => {
    mockRegistry(() => {
      throw new Error(
        '"component-registry.json" not found. Checked: /fake/dist. Run "pnpm build" to generate artifacts.',
      );
    });
    const { stderr } = await runList();
    expect(stderr).toContain('not found');
    expect(stderr).toContain('pnpm build');
    expect(process.exitCode).toBe(1);
  });

  it('shows parse error hint when registry is corrupted', async () => {
    mockRegistry(() => {
      throw new Error('Failed to parse "component-registry.json" at /fake/dist: Unexpected token');
    });
    const { stderr } = await runList();
    expect(stderr).toContain('Failed to parse');
    expect(stderr).toContain('corrupted');
    expect(process.exitCode).toBe(1);
  });
});
