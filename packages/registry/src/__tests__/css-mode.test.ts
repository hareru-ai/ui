import { describe, expect, it } from 'vitest';
import { CSS_MODES, CSS_MODE_DESCRIPTIONS, recommendCssMode } from '../css-mode.js';

describe('CSS_MODES', () => {
  it('contains exactly 4 modes', () => {
    expect(CSS_MODES).toHaveLength(4);
    expect(CSS_MODES).toContain('standalone');
    expect(CSS_MODES).toContain('portable');
    expect(CSS_MODES).toContain('tailwind');
    expect(CSS_MODES).toContain('per-component');
  });
});

describe('CSS_MODE_DESCRIPTIONS', () => {
  it('has a description for every mode', () => {
    for (const mode of CSS_MODES) {
      expect(CSS_MODE_DESCRIPTIONS[mode]).toBeTruthy();
      expect(typeof CSS_MODE_DESCRIPTIONS[mode]).toBe('string');
    }
  });
});

describe('recommendCssMode', () => {
  it('recommends tailwind when hasTailwind is true', () => {
    const result = recommendCssMode({ hasTailwind: true, componentCount: 10 });
    expect(result.mode).toBe('tailwind');
    expect(result.reason).toContain('Tailwind');
  });

  it('recommends per-component when few components used', () => {
    const result = recommendCssMode({ hasTailwind: false, componentCount: 2 });
    expect(result.mode).toBe('per-component');
    expect(result.reason).toContain('2');
  });

  it('recommends per-component for 1 component', () => {
    const result = recommendCssMode({ hasTailwind: false, componentCount: 1 });
    expect(result.mode).toBe('per-component');
  });

  it('recommends per-component for 3 components', () => {
    const result = recommendCssMode({ hasTailwind: false, componentCount: 3 });
    expect(result.mode).toBe('per-component');
  });

  it('recommends standalone for 4 components (boundary)', () => {
    const result = recommendCssMode({ hasTailwind: false, componentCount: 4 });
    expect(result.mode).toBe('standalone');
  });

  it('recommends standalone for many components', () => {
    const result = recommendCssMode({ hasTailwind: false, componentCount: 10 });
    expect(result.mode).toBe('standalone');
  });

  it('recommends standalone when componentCount is 0', () => {
    const result = recommendCssMode({ hasTailwind: false, componentCount: 0 });
    expect(result.mode).toBe('standalone');
  });

  it('recommends portable when hasExistingReset is true and many components', () => {
    const result = recommendCssMode({
      hasTailwind: false,
      componentCount: 10,
      hasExistingReset: true,
    });
    expect(result.mode).toBe('portable');
    expect(result.reason).toContain('reset');
  });

  it('recommends portable when hasExistingReset is true and 4 components', () => {
    const result = recommendCssMode({
      hasTailwind: false,
      componentCount: 4,
      hasExistingReset: true,
    });
    expect(result.mode).toBe('portable');
  });

  it('per-component takes priority over portable when few components', () => {
    const result = recommendCssMode({
      hasTailwind: false,
      componentCount: 2,
      hasExistingReset: true,
    });
    expect(result.mode).toBe('per-component');
  });

  it('prioritizes tailwind over hasExistingReset', () => {
    const result = recommendCssMode({
      hasTailwind: true,
      componentCount: 10,
      hasExistingReset: true,
    });
    expect(result.mode).toBe('tailwind');
  });

  it('prioritizes tailwind over component count', () => {
    const result = recommendCssMode({ hasTailwind: true, componentCount: 1 });
    expect(result.mode).toBe('tailwind');
  });

  it('standalone is default when hasExistingReset is false or omitted', () => {
    const result = recommendCssMode({
      hasTailwind: false,
      componentCount: 10,
      hasExistingReset: false,
    });
    expect(result.mode).toBe('standalone');
  });
});
