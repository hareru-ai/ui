import { describe, expect, it } from 'vitest';
import { c } from '../utils/colors.js';

describe('colors', () => {
  it('exports all semantic color functions', () => {
    expect(typeof c.success).toBe('function');
    expect(typeof c.warning).toBe('function');
    expect(typeof c.error).toBe('function');
    expect(typeof c.info).toBe('function');
    expect(typeof c.dim).toBe('function');
    expect(typeof c.bold).toBe('function');
    expect(typeof c.heading).toBe('function');
    expect(typeof c.code).toBe('function');
    expect(typeof c.path).toBe('function');
  });

  it('functions return string type', () => {
    expect(typeof c.success('x')).toBe('string');
    expect(typeof c.heading('x')).toBe('string');
    expect(typeof c.path('x')).toBe('string');
    expect(typeof c.error('x')).toBe('string');
    expect(typeof c.warning('x')).toBe('string');
    expect(typeof c.info('x')).toBe('string');
    expect(typeof c.dim('x')).toBe('string');
    expect(typeof c.bold('x')).toBe('string');
    expect(typeof c.code('x')).toBe('string');
  });

  it('success preserves input text', () => {
    expect(c.success('ok')).toContain('ok');
  });

  it('error preserves input text', () => {
    expect(c.error('fail')).toContain('fail');
  });

  it('warning preserves input text', () => {
    expect(c.warning('caution')).toContain('caution');
  });

  it('info preserves input text', () => {
    expect(c.info('note')).toContain('note');
  });

  it('dim preserves input text', () => {
    expect(c.dim('faded')).toContain('faded');
  });

  it('bold preserves input text', () => {
    expect(c.bold('strong')).toContain('strong');
  });

  it('heading preserves input text', () => {
    expect(c.heading('title')).toContain('title');
  });

  it('code preserves input text', () => {
    expect(c.code('const x = 1')).toContain('const x = 1');
  });

  it('path preserves input text', () => {
    expect(c.path('/some/path')).toContain('/some/path');
  });
});
