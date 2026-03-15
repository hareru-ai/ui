import { loadRegistry } from '@hareru/registry';
import type { Command } from 'commander';
import { formatBundleDetail, formatComponentDetail } from '../utils/format.js';

export function registerInfoCommand(program: Command): void {
  program
    .command('info <name>')
    .description('Show details for a component or task bundle')
    .option('--json', 'Output as JSON')
    .action((name: string, opts: { json?: boolean }) => {
      let registry: ReturnType<typeof loadRegistry>;
      try {
        registry = loadRegistry();
      } catch (err) {
        console.error((err as Error).message);
        process.exitCode = 1;
        return;
      }
      const nameLower = name.toLowerCase();

      // Search components (case-insensitive)
      const entry = registry.components.find((c) => c.name.toLowerCase() === nameLower);

      if (entry) {
        if (opts.json) {
          console.log(JSON.stringify(entry, null, 2));
        } else {
          console.log(formatComponentDetail(entry));
        }
        return;
      }

      // Search bundles (case-insensitive)
      const bundles = registry.taskBundles ?? [];
      const bundle = bundles.find((b) => b.name.toLowerCase() === nameLower);

      if (bundle) {
        const componentMap = new Map(registry.components.map((c) => [c.name, c]));
        if (opts.json) {
          console.log(JSON.stringify(bundle, null, 2));
        } else {
          console.log(formatBundleDetail(bundle, componentMap));
        }
        return;
      }

      // Fuzzy suggestion
      const allNames = [...registry.components.map((c) => c.name), ...bundles.map((b) => b.name)];
      const suggestions = allNames.filter(
        (n) => n.toLowerCase().includes(nameLower) || nameLower.includes(n.toLowerCase()),
      );

      if (suggestions.length > 0) {
        console.error(`"${name}" not found. Did you mean: ${suggestions.join(', ')}?`);
      } else {
        console.error(`"${name}" not found. Run "hareru list" to see available components.`);
      }
      process.exitCode = 1;
    });
}
