import { describe, expect, it } from 'vitest';
import { loadRegistry } from '../loader.js';
import type { SlotRole } from '../types.js';

const VALID_ROLES: SlotRole[] = [
  'trigger',
  'content',
  'container',
  'item',
  'label',
  'description',
  'action',
  'separator',
  'indicator',
  'viewport',
  'close',
  'icon',
  'input',
  'submenu',
  'anchor',
  'control',
];

describe('registry slots validation', () => {
  const registry = loadRegistry();

  it('at least 25 components have slots', () => {
    const withSlots = registry.components.filter((c) => c.slots && c.slots.length > 0);
    expect(withSlots.length).toBeGreaterThanOrEqual(25);
  });

  it('Toast has no slots', () => {
    const toast = registry.components.find((c) => c.name === 'Toast');
    expect(toast?.slots).toBeUndefined();
  });

  it('all slot roles are valid', () => {
    for (const comp of registry.components) {
      for (const slot of comp.slots ?? []) {
        expect(VALID_ROLES).toContain(slot.role);
      }
    }
  });

  it('no self-parent in any slot', () => {
    for (const comp of registry.components) {
      for (const slot of comp.slots ?? []) {
        expect(slot.parent).not.toBe(slot.name);
      }
    }
  });

  it('all slot parents reference root or another slot', () => {
    for (const comp of registry.components) {
      if (!comp.slots) continue;
      const slotNames = new Set(comp.slots.map((s) => s.name));
      for (const slot of comp.slots) {
        const validParent = slot.parent === comp.name || slotNames.has(slot.parent);
        expect(validParent).toBe(true);
      }
    }
  });

  it('all slots are reachable from root', () => {
    for (const comp of registry.components) {
      if (!comp.slots) continue;
      const reachable = new Set([comp.name]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const s of comp.slots) {
          if (reachable.has(s.parent) && !reachable.has(s.name)) {
            reachable.add(s.name);
            changed = true;
          }
        }
      }
      for (const s of comp.slots) {
        expect(reachable.has(s.name)).toBe(true);
      }
    }
  });

  it('no duplicate slot names within a component', () => {
    for (const comp of registry.components) {
      if (!comp.slots) continue;
      const names = comp.slots.map((s) => s.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('Dialog has 7 slots with correct structure', () => {
    const dialog = registry.components.find((c) => c.name === 'Dialog');
    expect(dialog?.slots).toHaveLength(7);
    const trigger = dialog?.slots?.find((s) => s.name === 'DialogTrigger');
    expect(trigger?.role).toBe('trigger');
    expect(trigger?.parent).toBe('Dialog');
    expect(trigger?.expected).toBe(true);
    const title = dialog?.slots?.find((s) => s.name === 'DialogTitle');
    expect(title?.parent).toBe('DialogContent');
    expect(title?.role).toBe('label');
  });

  it('Tabs has correct nesting (TabsTrigger parent is TabsList)', () => {
    const tabs = registry.components.find((c) => c.name === 'Tabs');
    const trigger = tabs?.slots?.find((s) => s.name === 'TabsTrigger');
    expect(trigger?.parent).toBe('TabsList');
  });

  it('DropdownMenu Sub chain is correct', () => {
    const dm = registry.components.find((c) => c.name === 'DropdownMenu');
    const sub = dm?.slots?.find((s) => s.name === 'DropdownMenuSub');
    expect(sub?.role).toBe('submenu');
    expect(sub?.parent).toBe('DropdownMenuContent');
    const subTrigger = dm?.slots?.find((s) => s.name === 'DropdownMenuSubTrigger');
    expect(subTrigger?.parent).toBe('DropdownMenuSub');
    const subContent = dm?.slots?.find((s) => s.name === 'DropdownMenuSubContent');
    expect(subContent?.parent).toBe('DropdownMenuSub');
  });
});
