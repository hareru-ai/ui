import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('loadJSON error handling', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.doUnmock('node:fs');
    vi.doUnmock('node:module');
    vi.restoreAllMocks();
  });

  it('includes parse context for corrupted dist JSON', async () => {
    vi.doMock('node:fs', async (importOriginal) => {
      const actual = await importOriginal<typeof import('node:fs')>();
      return {
        ...actual,
        existsSync: (p: string) => ((p as string).includes('dist') ? true : actual.existsSync(p)),
        readFileSync: (p: string, ...args: unknown[]) =>
          (p as string).includes('dist') ? '{broken' : actual.readFileSync(p, ...args),
      };
    });
    const { loadTokens } = await import('../loader.js');
    expect(() => loadTokens()).toThrow(/Failed to parse.*tokens\.json/);
  });

  it('includes read context for permission error', async () => {
    vi.doMock('node:fs', async (importOriginal) => {
      const actual = await importOriginal<typeof import('node:fs')>();
      return {
        ...actual,
        existsSync: (p: string) => ((p as string).includes('dist') ? true : actual.existsSync(p)),
        readFileSync: (p: string, ...args: unknown[]) => {
          if ((p as string).includes('dist')) {
            const err = new Error('EACCES: permission denied') as NodeJS.ErrnoException;
            err.code = 'EACCES';
            throw err;
          }
          return actual.readFileSync(p, ...args);
        },
      };
    });
    const { loadTokens } = await import('../loader.js');
    expect(() => loadTokens()).toThrow(/Failed to read.*tokens\.json/);
  });

  it('includes resolve context for missing workspace package', async () => {
    vi.doMock('node:fs', async (importOriginal) => {
      const actual = await importOriginal<typeof import('node:fs')>();
      return {
        ...actual,
        existsSync: () => false,
      };
    });
    vi.doMock('node:module', async (importOriginal) => {
      const actual = await importOriginal<typeof import('node:module')>();
      return {
        ...actual,
        createRequire: () => {
          const req = actual.createRequire(import.meta.url);
          return Object.assign((...args: Parameters<typeof req>) => req(...args), {
            resolve: () => {
              throw new Error('MODULE_NOT_FOUND');
            },
          });
        },
      };
    });
    const { loadTokens } = await import('../loader.js');
    expect(() => loadTokens()).toThrow(/Failed to resolve.*tokens\.json/);
  });

  it('preserves cause chain for parse errors', async () => {
    expect.assertions(1);
    vi.doMock('node:fs', async (importOriginal) => {
      const actual = await importOriginal<typeof import('node:fs')>();
      return {
        ...actual,
        existsSync: (p: string) => ((p as string).includes('dist') ? true : actual.existsSync(p)),
        readFileSync: (p: string, ...args: unknown[]) =>
          (p as string).includes('dist') ? '{broken' : actual.readFileSync(p, ...args),
      };
    });
    const { loadTokens } = await import('../loader.js');
    try {
      loadTokens();
    } catch (err) {
      expect((err as Error).cause).toBeInstanceOf(SyntaxError);
    }
  });

  it('throws "Failed to resolve" when dist missing and workspace resolve fails', async () => {
    vi.doMock('node:fs', async (importOriginal) => {
      const actual = await importOriginal<typeof import('node:fs')>();
      return {
        ...actual,
        existsSync: () => false,
      };
    });
    vi.doMock('node:module', async (importOriginal) => {
      const actual = await importOriginal<typeof import('node:module')>();
      return {
        ...actual,
        createRequire: () => {
          const req = actual.createRequire(import.meta.url);
          return Object.assign((...args: Parameters<typeof req>) => req(...args), {
            resolve: () => {
              throw new Error('MODULE_NOT_FOUND');
            },
          });
        },
      };
    });
    const { loadSchema } = await import('../loader.js');
    // With the new error hardening, resolve failure throws immediately with cause chain
    expect(() => loadSchema()).toThrow(/Failed to resolve.*tokens\.schema\.json/);
  });
});
