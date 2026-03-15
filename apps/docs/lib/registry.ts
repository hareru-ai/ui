// NOTE: hasStatesContent / hasA11yContent / hasSlotsContent logic is duplicated
// in scripts/verify-registry-docs.mjs — keep in sync

import type {
  A11yDef,
  ComponentEntry,
  ComponentRegistryJSON,
  SlotDef,
  StateDef,
} from '@hareru/registry';
// JSON import from @hareru/ui export map
// Requires `pnpm build` from monorepo root (or `pnpm dev`) before `next dev`
import registryData from '@hareru/ui/component-registry.json';

const registry = registryData as ComponentRegistryJSON;

export function getComponent(name: string): ComponentEntry | undefined {
  return registry.components.find((c) => c.name === name);
}

export function getComponentOrThrow(name: string): ComponentEntry {
  const entry = getComponent(name);
  if (!entry) {
    throw new Error(
      `[hareru-docs] Component "${name}" not found in registry. ` +
        `Check for typos in your MDX file. Available: ${registry.components.map((c) => c.name).join(', ')}`,
    );
  }
  return entry;
}

export function hasStatesContent(states?: StateDef[]): boolean {
  return !!(states && states.length > 0);
}

export function hasA11yContent(a11y?: A11yDef): boolean {
  if (!a11y) return false;
  return !!(
    a11y.roles?.length ||
    a11y.ariaAttributes?.length ||
    a11y.semanticElements?.length ||
    a11y.keyboardInteractions?.length ||
    a11y.liveRegion ||
    a11y.notes?.trim()
  );
}

export function hasSlotsContent(slots?: SlotDef[]): boolean {
  return !!(slots && slots.length > 0);
}
