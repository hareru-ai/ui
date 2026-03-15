import { getComponentOrThrow, hasSlotsContent } from '@/lib/registry';
import { SLOT_NOTES } from '@/lib/slot-notes';
import type { SlotDef } from '@hareru/registry';

interface SlotNode {
  slot: SlotDef;
  children: SlotNode[];
}

function buildTree(rootName: string, slots: SlotDef[]): SlotNode[] {
  const childrenOf = (parent: string): SlotNode[] =>
    slots
      .filter((s) => s.parent === parent)
      .map((s) => ({ slot: s, children: childrenOf(s.name) }));
  return childrenOf(rootName);
}

function SlotItem({ node }: { node: SlotNode }) {
  const { slot, children } = node;
  return (
    <li>
      <strong>{slot.name}</strong> <code>[{slot.role}]</code>
      {slot.expected && <em> (expected)</em>}
      {slot.multiple && <span> ×N</span>}
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <SlotItem key={child.slot.name} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function RegistrySlots({ name }: { name: string }) {
  const entry = getComponentOrThrow(name);
  const slots = entry.slots;
  if (!hasSlotsContent(slots)) return null;

  const tree = buildTree(name, slots ?? []);
  const notes = SLOT_NOTES[name];

  return (
    <>
      <ul>
        {tree.map((node) => (
          <SlotItem key={node.slot.name} node={node} />
        ))}
      </ul>
      <p>
        <em>(expected) = recommended in canonical composition, not runtime-required.</em>
      </p>
      {notes?.length ? (
        <ul>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
