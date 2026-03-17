import { c } from './colors.js';

/**
 * Print a styled registry load error with a contextual hint.
 * Centralised so that add/list/info commands stay in sync.
 */
export function printRegistryError(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(c.error(msg));

  if (msg.includes('not found') || msg.includes('Failed to resolve')) {
    console.error(c.dim('Run "pnpm build" to generate registry artifacts.'));
  } else if (msg.includes('Failed to parse')) {
    console.error(c.dim('The artifact file may be corrupted. Try "pnpm build" to regenerate.'));
  } else if (msg.includes('Failed to read')) {
    console.error(c.dim('Check file permissions for the registry artifacts.'));
  }
}
