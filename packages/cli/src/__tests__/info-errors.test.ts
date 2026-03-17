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

async function runInfo(name: string): Promise<{ stderr: string }> {
  const { createProgram } = await import('../index.js');
  const errs: string[] = [];
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const errSpy = vi.spyOn(console, 'error').mockImplementation((...a) => errs.push(a.join(' ')));
  const program = createProgram();
  program.exitOverride();
  try {
    program.parse(['node', 'hareru', 'info', name]);
  } catch {
    /* commander exitOverride */
  }
  logSpy.mockRestore();
  errSpy.mockRestore();
  return { stderr: stripAnsi(errs.join('\n')) };
}

describe('hareru info — registry error', () => {
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
    const { stderr } = await runInfo('Button');
    expect(stderr).toContain('not found');
    expect(stderr).toContain('pnpm build');
    expect(process.exitCode).toBe(1);
  });

  it('shows read error hint when permissions fail', async () => {
    mockRegistry(() => {
      throw new Error(
        'Failed to read "component-registry.json" at /fake/dist: EACCES: permission denied',
      );
    });
    const { stderr } = await runInfo('Button');
    expect(stderr).toContain('Failed to read');
    expect(stderr).toContain('permissions');
    expect(process.exitCode).toBe(1);
  });
});
