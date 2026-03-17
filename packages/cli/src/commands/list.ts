import { loadRegistry } from '@hareru/registry';
import type { Command } from 'commander';
import { formatBundleList, formatComponentList } from '../utils/format.js';
import { printRegistryError } from '../utils/registry-error.js';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List components or task bundles')
    .option('--bundles', 'List task bundles instead of components')
    .option('--group <group>', 'Filter by component group')
    .option('--json', 'Output as JSON')
    .action((opts: { bundles?: boolean; group?: string; json?: boolean }) => {
      let registry: ReturnType<typeof loadRegistry>;
      try {
        registry = loadRegistry();
      } catch (err) {
        printRegistryError(err);
        process.exitCode = 1;
        return;
      }

      if (opts.bundles) {
        const bundles = registry.taskBundles ?? [];
        if (opts.json) {
          console.log(JSON.stringify(bundles, null, 2));
        } else {
          console.log(formatBundleList(bundles));
        }
        return;
      }

      const components = registry.components;
      if (opts.json) {
        const filtered = opts.group ? components.filter((c) => c.group === opts.group) : components;
        console.log(
          JSON.stringify(
            filtered.map((c) => ({ name: c.name, group: c.group })),
            null,
            2,
          ),
        );
      } else {
        console.log(formatComponentList(components, opts.group));
      }
    });
}
