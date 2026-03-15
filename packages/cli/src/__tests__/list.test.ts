import { describe, expect, it, vi } from 'vitest';
import { createProgram } from '../index.js';

function runCommand(...args: string[]): { stdout: string; exitCode: number | undefined } {
  const logs: string[] = [];
  const spy = vi.spyOn(console, 'log').mockImplementation((...a) => logs.push(a.join(' ')));
  const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

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

  return { stdout: logs.join('\n'), exitCode };
}

describe('hareru list', () => {
  it('shows grouped component list', () => {
    const { stdout } = runCommand('list');
    expect(stdout).toContain('core:');
    expect(stdout).toContain('Button');
  });

  it('shows components for a specific group', () => {
    const { stdout } = runCommand('list', '--group', 'core');
    expect(stdout).toContain('core:');
    expect(stdout).toContain('Button');
    expect(stdout).not.toContain('agent:');
  });

  it('shows no components for unknown group', () => {
    const { stdout } = runCommand('list', '--group', 'nonexistent');
    expect(stdout).toContain('No components in group');
  });

  it('--bundles shows task bundles', () => {
    const { stdout } = runCommand('list', '--bundles');
    expect(stdout).toContain('agent-chat-shell');
  });

  it('--json outputs JSON array', () => {
    const { stdout } = runCommand('list', '--json');
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('group');
  });

  it('--bundles --json outputs JSON array', () => {
    const { stdout } = runCommand('list', '--bundles', '--json');
    const data = JSON.parse(stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('components');
  });

  it('--group core --json outputs filtered JSON', () => {
    const { stdout } = runCommand('list', '--group', 'core', '--json');
    const data = JSON.parse(stdout);
    expect(data.every((c: { group: string }) => c.group === 'core')).toBe(true);
  });

  it('groups are in the expected order', () => {
    const { stdout } = runCommand('list');
    const coreIdx = stdout.indexOf('core:');
    const formIdx = stdout.indexOf('form:');
    const agentIdx = stdout.indexOf('agent:');
    expect(coreIdx).toBeLessThan(formIdx);
    expect(formIdx).toBeLessThan(agentIdx);
  });
});
