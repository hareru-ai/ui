import { resolve } from 'node:path';
import { loadRegistry } from '@hareru/registry';
import type { ComponentEntry, TaskBundle } from '@hareru/registry';
import type { Command } from 'commander';
import { c } from '../utils/colors.js';
import { detectCssFile } from '../utils/css-detector.js';
import { writeCssImports } from '../utils/css-writer.js';
import {
  CSS_MODES,
  type CssImportOptions,
  type CssMode,
  formatAddGuide,
  generateCssImports,
} from '../utils/format.js';
import { detectPackage } from '../utils/pkg-detector.js';

export function registerAddCommand(program: Command): void {
  program
    .command('add <name>')
    .description(
      'Add a component or task bundle — outputs guide by default, --write for auto CSS import',
    )
    .option('--mode <mode>', `CSS mode: ${CSS_MODES.join(', ')}`, 'per-component')
    .option('--write', 'Auto-write CSS imports to your CSS file')
    .option('--css-file <path>', 'CSS file to write imports to (auto-detected if omitted)')
    .option('--scope', 'Add styles/scope.css import')
    .option('--baseline', 'Add styles/baseline.css import')
    .option('--layer', 'Use layer-wrapped CSS variant')
    .option('--force', 'Skip dependency check with --write')
    .option('--json', 'Output as JSON')
    .action(
      (
        name: string,
        opts: {
          mode: string;
          write?: boolean;
          cssFile?: string;
          scope?: boolean;
          baseline?: boolean;
          layer?: boolean;
          force?: boolean;
          json?: boolean;
        },
      ) => {
        // Validate mode
        if (!CSS_MODES.includes(opts.mode as CssMode)) {
          console.error(
            c.error(`Invalid mode "${opts.mode}". Valid modes: ${CSS_MODES.join(', ')}`),
          );
          process.exitCode = 1;
          return;
        }
        const mode = opts.mode as CssMode;

        let registry: ReturnType<typeof loadRegistry>;
        try {
          registry = loadRegistry();
        } catch (err) {
          console.error((err as Error).message);
          process.exitCode = 1;
          return;
        }
        const nameLower = name.toLowerCase();

        // Resolve component or bundle
        let entry: ComponentEntry | undefined;
        let bundle: TaskBundle | undefined;

        entry = registry.components.find((comp) => comp.name.toLowerCase() === nameLower);
        if (!entry) {
          const bundles = registry.taskBundles ?? [];
          bundle = bundles.find((b) => b.name.toLowerCase() === nameLower);
        }

        if (!entry && !bundle) {
          const allNames = [
            ...registry.components.map((comp) => comp.name),
            ...(registry.taskBundles ?? []).map((b) => b.name),
          ];
          const suggestions = allNames.filter(
            (n) => n.toLowerCase().includes(nameLower) || nameLower.includes(n.toLowerCase()),
          );
          if (suggestions.length > 0) {
            console.error(
              `${c.error(`"${name}" not found.`)} Did you mean: ${suggestions.join(', ')}?`,
            );
          } else {
            console.error(
              `${c.error(`"${name}" not found.`)} Run "hareru list" to see available components.`,
            );
          }
          process.exitCode = 1;
          return;
        }

        const importOptions: CssImportOptions = {
          mode,
          layer: opts.layer,
          scope: opts.scope,
          baseline: opts.baseline,
        };

        const { imports: cssImports, warnings } = generateCssImports(importOptions, entry, bundle);

        // JS imports (deduplicated via Set)
        const jsImports: string[] = [];
        if (entry) {
          const subs = entry.subcomponents ?? [];
          const allNames = [entry.name, ...subs];
          jsImports.push(`import { ${allNames.join(', ')} } from '@hareru/ui';`);
        } else if (bundle) {
          const componentMap = new Map(registry.components.map((comp) => [comp.name, comp]));
          const seen = new Set<string>();
          const allImportNames: string[] = [];
          for (const compName of bundle.components) {
            if (!seen.has(compName)) {
              seen.add(compName);
              allImportNames.push(compName);
            }
            const comp = componentMap.get(compName);
            if (comp?.subcomponents) {
              for (const sub of comp.subcomponents) {
                if (!seen.has(sub)) {
                  seen.add(sub);
                  allImportNames.push(sub);
                }
              }
            }
          }
          jsImports.push(`import { ${allImportNames.join(', ')} } from '@hareru/ui';`);
        }

        // Detect package once for both write and guide mode
        const cwd = process.cwd();
        const pkg = detectPackage(cwd);

        // --write mode
        if (opts.write) {
          // Dependency check (unless --force)
          if (!opts.force) {
            if (!pkg.found) {
              console.error(`${c.error('No package.json found.')} Cannot verify dependencies.`);
              console.error('');
              console.error('Initialize a project first, then install:');
              console.error(`  ${pkg.installCommand}`);
              console.error('');
              console.error(`To skip this check, use ${c.bold('--force')}.`);
              process.exitCode = 1;
              return;
            }
            if (pkg.parseError) {
              console.error(c.error(pkg.parseError));
              console.error('');
              console.error('Fix your package.json and re-run the command.');
              console.error(`To skip this check, use ${c.bold('--force')}.`);
              process.exitCode = 1;
              return;
            }
            if (!pkg.installed.tokens || !pkg.installed.ui) {
              console.error(`${c.error('Missing dependencies.')} Run the following first:`);
              console.error('');
              console.error(`  ${pkg.installCommand}`);
              console.error('');
              console.error(`Then re-run: hareru add ${name} --write`);
              console.error('');
              console.error(`To skip this check, use ${c.bold('--force')}.`);
              process.exitCode = 1;
              return;
            }
          }

          // CSS file detection
          const cssFilePath = opts.cssFile ? resolve(opts.cssFile) : detectCssFile(cwd);
          if (!cssFilePath) {
            console.error(c.error('Could not find a CSS file to write to.'));
            console.error(`Use ${c.bold('--css-file <path>')} to specify one.`);
            process.exitCode = 1;
            return;
          }

          // Filter to only @import and @layer lines for writing
          const writableImports = cssImports.filter(
            (line) => line.startsWith('@import ') || line.startsWith('@layer '),
          );

          let result: ReturnType<typeof writeCssImports>;
          try {
            result = writeCssImports(cssFilePath, writableImports);
          } catch (err) {
            // ENOENT is covered by add.test.ts "--write --css-file with nonexistent path".
            // EACCES is not integration-tested — chmod-based tests are flaky cross-platform.
            const e = err as NodeJS.ErrnoException;
            if (e.code === 'ENOENT') {
              console.error(`${c.error('File not found:')} ${c.path(cssFilePath)}`);
            } else if (e.code === 'EACCES') {
              console.error(`${c.error('Permission denied:')} ${c.path(cssFilePath)}`);
            } else {
              console.error(`${c.error('Failed to write CSS imports:')} ${e.message}`);
            }
            process.exitCode = 1;
            return;
          }

          if (opts.json) {
            console.log(
              JSON.stringify(
                {
                  name: entry?.name ?? bundle?.name,
                  type: entry ? 'component' : 'bundle',
                  cssFile: result.filePath,
                  added: result.added,
                  skipped: result.skipped,
                  jsImports,
                  warnings,
                },
                null,
                2,
              ),
            );
          } else {
            if (warnings.length > 0) {
              for (const w of warnings) {
                console.log(`${c.warning('Warning:')} ${w}`);
              }
              console.log('');
            }
            if (result.added.length > 0) {
              console.log(`${c.success('Added to')} ${c.path(result.filePath)}:`);
              for (const line of result.added) {
                console.log(`  ${line}`);
              }
            }
            if (result.skipped.length > 0) {
              console.log(`${c.dim('Already present (skipped)')}:`);
              for (const line of result.skipped) {
                console.log(`  ${c.dim(line)}`);
              }
            }
            if (result.added.length === 0 && result.skipped.length > 0) {
              console.log(c.info('All CSS imports already present.'));
            }
            console.log('');
            console.log(`${c.heading('Import')}:`);
            for (const imp of jsImports) {
              console.log(`  ${imp}`);
            }
          }
          return;
        }

        // Guide mode (default)
        const installCmd =
          pkg.found && !pkg.parseError && pkg.installed.tokens && pkg.installed.ui
            ? null
            : pkg.installCommand || null;

        if (opts.json) {
          const payload: Record<string, unknown> = {
            name: entry?.name ?? bundle?.name,
            type: entry ? 'component' : 'bundle',
            mode,
            installCommand: installCmd,
            cssImports,
            jsImports,
            warnings,
          };
          if (pkg.parseError) {
            payload.parseError = pkg.parseError;
          }
          console.log(JSON.stringify(payload, null, 2));
        } else {
          if (pkg.parseError) {
            console.error(`${c.warning('Warning:')} ${pkg.parseError}`);
            console.error('');
          }
          console.log(
            formatAddGuide(
              entry?.name ?? bundle?.name ?? name,
              importOptions,
              cssImports,
              jsImports,
              warnings,
              installCmd,
            ),
          );
        }
      },
    );
}
