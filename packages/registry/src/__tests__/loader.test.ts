import { describe, expect, it } from 'vitest';
import {
  loadComponentSchema,
  loadConsumerRules,
  loadRegistry,
  loadSchema,
  loadTokens,
} from '../loader.js';

describe('loadTokens', () => {
  it('returns light and dark themes', () => {
    const tokens = loadTokens();
    expect(tokens).toHaveProperty('light');
    expect(tokens).toHaveProperty('dark');
  });

  it('contains color tokens in light theme', () => {
    const tokens = loadTokens();
    expect(tokens.light).toHaveProperty('color');
  });

  it('returns cached result on second call', () => {
    const a = loadTokens();
    const b = loadTokens();
    expect(a).toBe(b);
  });
});

describe('loadSchema', () => {
  it('returns valid JSON Schema', () => {
    const schema = loadSchema();
    expect(schema.$schema).toContain('json-schema.org');
    expect(schema.title).toBe('Hareru UI Design Tokens');
  });

  it('contains cssVariables enum', () => {
    const schema = loadSchema();
    const vars = schema.properties.cssVariables.items.enum;
    expect(vars.length).toBeGreaterThan(0);
    expect(vars).toContain('--hui-color-primary');
  });

  it('contains typeConstraints with color pattern', () => {
    const schema = loadSchema();
    const colorConstraint = schema.properties.typeConstraints.properties.color;
    expect(colorConstraint).toBeDefined();
    expect(colorConstraint.pattern).toContain('oklch');
  });
});

describe('loadRegistry', () => {
  it('returns component registry with correct structure', () => {
    const registry = loadRegistry();
    expect(registry.name).toBe('@hareru/ui');
    expect(registry.componentCount).toBeGreaterThan(0);
    expect(registry.components.length).toBe(registry.componentCount);
  });

  it('contains Button component', () => {
    const registry = loadRegistry();
    const button = registry.components.find((c) => c.name === 'Button');
    expect(button).toBeDefined();
    expect(button?.displayName).toBe('Button');
  });

  it('Button has variant definitions', () => {
    const registry = loadRegistry();
    const button = registry.components.find((c) => c.name === 'Button');
    expect(button?.variants?.length).toBeGreaterThan(0);
  });

  it('every component has componentSource and description', () => {
    const registry = loadRegistry();
    for (const comp of registry.components) {
      expect(comp.componentSource, `${comp.name} componentSource`).toBeTruthy();
      expect(comp.description, `${comp.name} description`).toBeTruthy();
    }
  });

  it('has taskBundles with at least 1 entry', () => {
    const registry = loadRegistry();
    expect(registry.taskBundles).toBeDefined();
    expect(registry.taskBundles?.length).toBeGreaterThanOrEqual(1);
  });

  it('AlertDialog displayName matches component name', () => {
    const registry = loadRegistry();
    const ad = registry.components.find((c) => c.name === 'AlertDialog');
    expect(ad?.displayName).toBe('AlertDialog');
  });

  it('BentoGrid subcomponents does not include constants', () => {
    const registry = loadRegistry();
    const bg = registry.components.find((c) => c.name === 'BentoGrid');
    expect(bg?.subcomponents).not.toContain('BENTO_PRESETS');
  });

  it('BentoGrid props has no bogus "default" property', () => {
    const registry = loadRegistry();
    const bg = registry.components.find((c) => c.name === 'BentoGrid');
    const allCustomProps = bg?.props?.flatMap((p) => p.customProps ?? []) ?? [];
    expect(allCustomProps.find((p) => p.name === 'default')).toBeUndefined();
  });
});

describe('loadRegistry — Phase 3C fields', () => {
  it('ApprovalCard has states with status enum', () => {
    const registry = loadRegistry();
    const ac = registry.components.find((c) => c.name === 'ApprovalCard');
    expect(ac?.states).toBeDefined();
    const statusState = ac?.states?.find((s) => s.name === 'status');
    expect(statusState).toBeDefined();
    expect(statusState?.type).toBe('enum');
    if (statusState?.type === 'enum') {
      expect(statusState.values).toContain('pending');
      expect(statusState.values).toContain('approved');
    }
  });

  it('StreamingText has liveRegion true in a11y', () => {
    const registry = loadRegistry();
    const st = registry.components.find((c) => c.name === 'StreamingText');
    expect(st?.a11y).toBeDefined();
    expect(st?.a11y?.liveRegion).toBe(true);
    expect(st?.a11y?.semanticElements).toContain('output');
  });

  it('Button has examples with non-empty code', () => {
    const registry = loadRegistry();
    const btn = registry.components.find((c) => c.name === 'Button');
    expect(btn?.examples).toBeDefined();
    expect(btn?.examples?.length).toBeGreaterThan(0);
    expect(btn?.examples?.[0].code.length).toBeGreaterThan(0);
  });

  it('states type is valid ("boolean" or "enum")', () => {
    const registry = loadRegistry();
    for (const comp of registry.components) {
      for (const state of comp.states ?? []) {
        expect(
          ['boolean', 'enum'].includes(state.type),
          `${comp.name}.states.${state.name} has valid type "${state.type}"`,
        ).toBe(true);
      }
    }
  });

  it('enum states defaultValue is one of values', () => {
    const registry = loadRegistry();
    for (const comp of registry.components) {
      for (const state of comp.states ?? []) {
        if (state.type === 'enum' && state.defaultValue) {
          expect(
            state.values.includes(state.defaultValue),
            `${comp.name}.states.${state.name} defaultValue "${state.defaultValue}" must be in values [${state.values.join(', ')}]`,
          ).toBe(true);
        }
      }
    }
  });

  it('enum states have non-empty values array', () => {
    const registry = loadRegistry();
    for (const comp of registry.components) {
      for (const state of comp.states ?? []) {
        if (state.type === 'enum') {
          expect(
            state.values.length,
            `${comp.name}.states.${state.name} enum has values`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it('boolean states do not have values or defaultValue', () => {
    const registry = loadRegistry();
    for (const comp of registry.components) {
      for (const state of comp.states ?? []) {
        if (state.type === 'boolean') {
          expect(
            'values' in state,
            `${comp.name}.states.${state.name} boolean should not have values`,
          ).toBe(false);
          expect(
            'defaultValue' in state,
            `${comp.name}.states.${state.name} boolean should not have defaultValue`,
          ).toBe(false);
        }
      }
    }
  });

  it('Toggle has pressed boolean state auto-extracted', () => {
    const registry = loadRegistry();
    const toggle = registry.components.find((c) => c.name === 'Toggle');
    const pressedState = toggle?.states?.find((s) => s.name === 'pressed');
    expect(pressedState).toBeDefined();
    expect(pressedState?.type).toBe('boolean');
  });

  // False positive guards — compound component child props must not appear as root states
  it('Select does not have disabled state (it belongs to SelectItem)', () => {
    const registry = loadRegistry();
    const select = registry.components.find((c) => c.name === 'Select');
    const disabledState = select?.states?.find((s) => s.name === 'disabled');
    expect(disabledState).toBeUndefined();
  });

  it('DropdownMenu does not have disabled or checked state (child props)', () => {
    const registry = loadRegistry();
    const dm = registry.components.find((c) => c.name === 'DropdownMenu');
    const disabledState = dm?.states?.find((s) => s.name === 'disabled');
    const checkedState = dm?.states?.find((s) => s.name === 'checked');
    expect(disabledState).toBeUndefined();
    expect(checkedState).toBeUndefined();
  });

  it('ToolCallCard a11y does not contain alert role (belongs to nested error paragraph)', () => {
    const registry = loadRegistry();
    const tc = registry.components.find((c) => c.name === 'ToolCallCard');
    expect(tc?.a11y?.roles ?? []).not.toContain('alert');
  });

  it('ToolCallCard does not have streaming state (comment false positive)', () => {
    const registry = loadRegistry();
    const tc = registry.components.find((c) => c.name === 'ToolCallCard');
    const streamingState = tc?.states?.find((s) => s.name === 'streaming');
    expect(streamingState).toBeUndefined();
  });

  // Manifest data accuracy
  it('ToolCallCard status enum matches implementation', () => {
    const registry = loadRegistry();
    const tc = registry.components.find((c) => c.name === 'ToolCallCard');
    const statusState = tc?.states?.find((s) => s.name === 'status');
    expect(statusState?.type).toBe('enum');
    if (statusState?.type === 'enum') {
      expect(statusState.values).toEqual(['pending', 'executing', 'done', 'error']);
    }
  });

  it('ReasoningPanel status enum matches implementation', () => {
    const registry = loadRegistry();
    const rp = registry.components.find((c) => c.name === 'ReasoningPanel');
    const statusState = rp?.states?.find((s) => s.name === 'status');
    expect(statusState?.type).toBe('enum');
    if (statusState?.type === 'enum') {
      expect(statusState.values).toEqual(['thinking', 'done']);
    }
  });

  // Expression-body forwardRef scoping (=> ( ... ) components)
  it('EmptyState has role="status" in a11y (expression-body component)', () => {
    const registry = loadRegistry();
    const es = registry.components.find((c) => c.name === 'EmptyState');
    expect(es?.a11y?.roles).toContain('status');
  });

  it('EmptyState example uses compound subcomponents not props', () => {
    const registry = loadRegistry();
    const es = registry.components.find((c) => c.name === 'EmptyState');
    const code = es?.examples?.[0]?.code ?? '';
    expect(code).toContain('EmptyStateTitle');
    expect(code).not.toContain('title=');
  });

  it('DataQualityIndicator example uses correct prop names', () => {
    const registry = loadRegistry();
    const dq = registry.components.find((c) => c.name === 'DataQualityIndicator');
    const code = dq?.examples?.[0]?.code ?? '';
    expect(code).toContain('overallScore');
    expect(code).toContain('alertLevel');
    expect(code).not.toMatch(/\bscore=\{/); // should not use bare "score=" as root prop
  });

  it('Card a11y detects article from expression-body forwardRef', () => {
    const registry = loadRegistry();
    const card = registry.components.find((c) => c.name === 'Card');
    expect(card?.a11y?.semanticElements).toContain('article');
  });

  it('SemanticSuggest is not described as combobox', () => {
    const registry = loadRegistry();
    const ss = registry.components.find((c) => c.name === 'SemanticSuggest');
    expect(ss?.a11y?.roles ?? []).not.toContain('combobox');
    expect(ss?.a11y?.semanticElements).toContain('article');
  });
});

describe('loadComponentSchema', () => {
  it('returns valid JSON Schema', () => {
    const schema = loadComponentSchema();
    expect(schema.$schema).toContain('json-schema.org');
    expect(schema.properties).toBeDefined();
  });

  it('defines component entry structure', () => {
    const schema = loadComponentSchema();
    expect(schema.properties).toHaveProperty('components');
  });
});

describe('loadConsumerRules', () => {
  it('returns consumer rules with version', () => {
    const rules = loadConsumerRules();
    expect(rules.version).toBeDefined();
  });

  it('contains cssImports rules', () => {
    const rules = loadConsumerRules();
    expect(rules.rules).toHaveProperty('cssImports');
    expect(rules.rules.cssImports.rules.length).toBeGreaterThan(0);
  });

  it('contains tokenQuickReference', () => {
    const rules = loadConsumerRules();
    expect(rules.tokenQuickReference).toHaveProperty('color');
    expect(rules.tokenQuickReference).toHaveProperty('spacing');
  });
});
