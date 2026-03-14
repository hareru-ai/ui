import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const COMPONENTS_DIR = path.resolve(__dirname, '../components');

const OVERLAY_SURFACES = [
  { file: 'Dialog/Dialog.css', selectors: ['.hui-dialog__content'] },
  { file: 'Sheet/Sheet.css', selectors: ['.hui-sheet__content'] },
  { file: 'AlertDialog/AlertDialog.css', selectors: ['.hui-alert-dialog__content'] },
  { file: 'Toast/Toast.css', selectors: ['.hui-toast'] },
  { file: 'Popover/Popover.css', selectors: ['.hui-popover__content'] },
  { file: 'Combobox/Combobox.css', selectors: ['.hui-combobox__content'] },
  { file: 'Command/Command.css', selectors: ['.hui-command-dialog__content'] },
  { file: 'Select/Select.css', selectors: ['.hui-select__content'] },
  {
    file: 'DropdownMenu/DropdownMenu.css',
    selectors: ['.hui-dropdown-menu__content', '.hui-dropdown-menu__sub-content'],
  },
  { file: 'NavigationMenu/NavigationMenu.css', selectors: ['.hui-navigation-menu__popup'] },
  { file: 'Tooltip/Tooltip.css', selectors: ['.hui-tooltip__content'] },
];

/**
 * Check if any rule block for the given selector contains the target property.
 * Handles selectors that appear in multiple rule blocks (e.g. Combobox.css).
 */
function selectorHasProperty(css: string, selector: string, property: string): boolean {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?:^|[},\\s])${escaped}\\s*\\{([^}]*)\\}`, 'gm');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(css)) !== null) {
    if (match[1].includes(property)) {
      return true;
    }
  }
  return false;
}

describe('Overlay surface font-family', () => {
  for (const { file, selectors } of OVERLAY_SURFACES) {
    for (const selector of selectors) {
      it(`${file} — ${selector} has font-family`, () => {
        const cssPath = path.join(COMPONENTS_DIR, file);
        const css = readFileSync(cssPath, 'utf-8');
        expect(selectorHasProperty(css, selector, 'font-family')).toBe(true);
      });
    }
  }
});
