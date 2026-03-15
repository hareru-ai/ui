import { describe, expect, it } from 'vitest';
import {
  loadComponentSchema,
  loadConsumerRules,
  loadRegistry,
  loadSchema,
  loadTokens,
} from '../utils.js';

describe('re-exports from @hareru/registry', () => {
  it('loadTokens is a function', () => {
    expect(typeof loadTokens).toBe('function');
  });

  it('loadSchema is a function', () => {
    expect(typeof loadSchema).toBe('function');
  });

  it('loadRegistry is a function', () => {
    expect(typeof loadRegistry).toBe('function');
  });

  it('loadComponentSchema is a function', () => {
    expect(typeof loadComponentSchema).toBe('function');
  });

  it('loadConsumerRules is a function', () => {
    expect(typeof loadConsumerRules).toBe('function');
  });
});
