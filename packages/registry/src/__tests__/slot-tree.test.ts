import { describe, expect, it } from 'vitest';
import { buildSlotTree } from '../slot-tree.js';
import type { SlotDef } from '../types.js';

describe('buildSlotTree', () => {
  it('returns empty string for undefined slots', () => {
    expect(buildSlotTree('Button', undefined)).toBe('');
  });

  it('returns empty string for empty slots array', () => {
    expect(buildSlotTree('Button', [])).toBe('');
  });

  it('renders a simple two-slot tree', () => {
    const slots: SlotDef[] = [
      {
        name: 'CollapsibleTrigger',
        role: 'trigger',
        parent: 'Collapsible',
        expected: true,
        multiple: false,
      },
      {
        name: 'CollapsibleContent',
        role: 'content',
        parent: 'Collapsible',
        expected: true,
        multiple: false,
      },
    ];
    const result = buildSlotTree('Collapsible', slots);
    expect(result).toContain('Collapsible');
    expect(result).toContain('├── CollapsibleTrigger [trigger] (expected)');
    expect(result).toContain('└── CollapsibleContent [content] (expected)');
    expect(result).toContain(
      '(expected) = recommended in canonical composition, not runtime-required.',
    );
  });

  it('renders nested slots correctly', () => {
    const slots: SlotDef[] = [
      { name: 'DialogTrigger', role: 'trigger', parent: 'Dialog', expected: true, multiple: false },
      { name: 'DialogContent', role: 'content', parent: 'Dialog', expected: true, multiple: false },
      {
        name: 'DialogTitle',
        role: 'label',
        parent: 'DialogContent',
        expected: true,
        multiple: false,
      },
      {
        name: 'DialogDescription',
        role: 'description',
        parent: 'DialogContent',
        expected: false,
        multiple: false,
      },
      {
        name: 'DialogClose',
        role: 'close',
        parent: 'DialogContent',
        expected: false,
        multiple: false,
      },
    ];
    const result = buildSlotTree('Dialog', slots);
    expect(result).toContain('Dialog');
    expect(result).toContain('├── DialogTrigger [trigger] (expected)');
    expect(result).toContain('└── DialogContent [content] (expected)');
    expect(result).toContain('    ├── DialogTitle [label] (expected)');
    expect(result).toContain('    ├── DialogDescription [description]');
    expect(result).toContain('    └── DialogClose [close]');
  });

  it('does not show (expected) for expected=false slots', () => {
    const slots: SlotDef[] = [
      { name: 'AlertTitle', role: 'label', parent: 'Alert', expected: false, multiple: false },
    ];
    const result = buildSlotTree('Alert', slots);
    expect(result).toContain('└── AlertTitle [label]');
    expect(result).not.toContain('AlertTitle [label] (expected)');
  });

  it('appends notes when provided', () => {
    const slots: SlotDef[] = [
      { name: 'TableBody', role: 'container', parent: 'Table', expected: true, multiple: false },
      { name: 'TableRow', role: 'item', parent: 'TableBody', expected: true, multiple: true },
    ];
    const result = buildSlotTree('Table', slots, ['TableRow is also valid inside TableHeader.']);
    expect(result).toContain('Note: TableRow is also valid inside TableHeader.');
  });

  it('preserves manifest array order for siblings', () => {
    const slots: SlotDef[] = [
      { name: 'DialogTrigger', role: 'trigger', parent: 'Dialog', expected: true, multiple: false },
      { name: 'DialogContent', role: 'content', parent: 'Dialog', expected: true, multiple: false },
      {
        name: 'DialogHeader',
        role: 'container',
        parent: 'DialogContent',
        expected: false,
        multiple: false,
      },
      {
        name: 'DialogFooter',
        role: 'container',
        parent: 'DialogContent',
        expected: false,
        multiple: false,
      },
      {
        name: 'DialogTitle',
        role: 'label',
        parent: 'DialogContent',
        expected: true,
        multiple: false,
      },
      {
        name: 'DialogDescription',
        role: 'description',
        parent: 'DialogContent',
        expected: false,
        multiple: false,
      },
      {
        name: 'DialogClose',
        role: 'close',
        parent: 'DialogContent',
        expected: false,
        multiple: false,
      },
    ];
    const result = buildSlotTree('Dialog', slots);
    const lines = result.split('\n');
    const headerIdx = lines.findIndex((l) => l.includes('DialogHeader'));
    const footerIdx = lines.findIndex((l) => l.includes('DialogFooter'));
    const titleIdx = lines.findIndex((l) => l.includes('DialogTitle'));
    expect(headerIdx).toBeLessThan(footerIdx);
    expect(footerIdx).toBeLessThan(titleIdx);
  });
});
