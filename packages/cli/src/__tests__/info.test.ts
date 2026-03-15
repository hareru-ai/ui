import { describe, expect, it, vi } from 'vitest';
import { createProgram } from '../index.js';

function runCommand(...args: string[]): {
  stdout: string;
  stderr: string;
  exitCode: number | undefined;
} {
  const logs: string[] = [];
  const errs: string[] = [];
  const spy = vi.spyOn(console, 'log').mockImplementation((...a) => logs.push(a.join(' ')));
  const errSpy = vi.spyOn(console, 'error').mockImplementation((...a) => errs.push(a.join(' ')));

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

  return { stdout: logs.join('\n'), stderr: errs.join('\n'), exitCode };
}

describe('hareru info', () => {
  it('shows component details for Button', () => {
    const { stdout } = runCommand('info', 'Button');
    expect(stdout).toContain('Button');
    expect(stdout).toContain('Group: core');
    expect(stdout).toContain('@hareru/ui/styles/components/Button.css');
    expect(stdout).toContain('import {');
  });

  it('is case-insensitive', () => {
    const { stdout } = runCommand('info', 'button');
    expect(stdout).toContain('Button');
    expect(stdout).toContain('Group: core');
  });

  it('shows bundle details', () => {
    const { stdout } = runCommand('info', 'agent-chat-shell');
    expect(stdout).toContain('Bundle: agent-chat-shell');
    expect(stdout).toContain('Components:');
  });

  it('shows not found for unknown name', () => {
    const { stderr, exitCode } = runCommand('info', 'nonexistent');
    expect(stderr).toContain('not found');
    expect(exitCode).toBe(1);
  });

  it('suggests similar names', () => {
    const { stderr } = runCommand('info', 'but');
    expect(stderr).toContain('Button');
  });

  it('--json outputs JSON for component', () => {
    const { stdout } = runCommand('info', '--json', 'Button');
    const data = JSON.parse(stdout);
    expect(data.name).toBe('Button');
    expect(data.group).toBe('core');
  });

  it('--json outputs JSON for bundle', () => {
    const { stdout } = runCommand('info', '--json', 'agent-chat-shell');
    const data = JSON.parse(stdout);
    expect(data.name).toBe('agent-chat-shell');
    expect(data).toHaveProperty('components');
  });

  it('shows variants for Button', () => {
    const { stdout } = runCommand('info', 'Button');
    expect(stdout).toContain('Variants:');
    expect(stdout).toContain('variant:');
  });

  it('shows states for ApprovalCard', () => {
    const { stdout } = runCommand('info', 'ApprovalCard');
    expect(stdout).toContain('States:');
    expect(stdout).toContain('status:');
    expect(stdout).toContain('pending');
  });

  it('shows accessibility for Dialog', () => {
    const { stdout } = runCommand('info', 'Dialog');
    expect(stdout).toContain('Accessibility:');
    expect(stdout).toContain('dialog');
  });

  it('shows example for Button', () => {
    const { stdout } = runCommand('info', 'Button');
    expect(stdout).toContain('Example:');
  });

  it('shows Structure for Dialog', () => {
    const { stdout } = runCommand('info', 'Dialog');
    expect(stdout).toContain('Structure:');
    expect(stdout).toContain('DialogTrigger [trigger] (expected)');
    expect(stdout).toContain(
      '(expected) = recommended in canonical composition, not runtime-required.',
    );
  });

  it('omits Structure for Button', () => {
    const { stdout } = runCommand('info', 'Button');
    expect(stdout).not.toContain('Structure:');
  });

  it('omits Structure for Toast (has subcomponents but no slots)', () => {
    const { stdout } = runCommand('info', 'Toast');
    expect(stdout).not.toContain('Structure:');
  });
});
