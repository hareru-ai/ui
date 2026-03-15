import type { SlotDef } from './types.js';

/**
 * Build a visual slot tree string from a root component name and its slots.
 *
 * Output format:
 * ```
 * Dialog
 * ├── DialogTrigger [trigger] (expected)
 * └── DialogContent [content] (expected)
 *     ├── DialogHeader [container]
 *     └── DialogClose [close]
 *
 * (expected) = recommended in canonical composition, not runtime-required.
 * ```
 *
 * @param rootName - Root component name (e.g. "Dialog")
 * @param slots - Array of SlotDef entries
 * @param notes - Optional notes to append after the tree (e.g. "TableRow is also valid inside TableHeader.")
 * @returns Formatted tree string, or empty string if slots is empty/undefined
 */
export function buildSlotTree(
  rootName: string,
  slots: SlotDef[] | undefined,
  notes?: string[],
): string {
  if (!slots || slots.length === 0) return '';

  // Build child map preserving array order
  const childMap = new Map<string, SlotDef[]>();
  for (const s of slots) {
    if (!childMap.has(s.parent)) childMap.set(s.parent, []);
    childMap.get(s.parent)?.push(s);
  }

  const lines: string[] = [rootName];

  function renderChildren(parent: string, prefix: string): void {
    const children = childMap.get(parent);
    if (!children) return;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const isLast = i === children.length - 1;
      const connector = isLast ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
      const annotation = `[${child.role}]${child.expected ? ' (expected)' : ''}`;
      lines.push(`${prefix}${connector}${child.name} ${annotation}`);

      const childPrefix = prefix + (isLast ? '    ' : '\u2502   ');
      renderChildren(child.name, childPrefix);
    }
  }

  renderChildren(rootName, '');

  lines.push('');

  if (notes && notes.length > 0) {
    for (const note of notes) {
      lines.push(`Note: ${note}`);
    }
    lines.push('');
  }

  lines.push('(expected) = recommended in canonical composition, not runtime-required.');

  return lines.join('\n');
}
