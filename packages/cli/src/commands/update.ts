import { existsSync, readFileSync } from 'node:fs';
import type { Command } from 'commander';
import { c } from '../utils/colors.js';
import { loadConfig, resolveCssFilePath, updateConfig } from '../utils/config.js';
import type { InitMode } from '../utils/config.js';
import {
  findManagedBlock,
  findTailwindImport,
  findUnmanagedHareruImports,
  replaceManagedBlock,
} from '../utils/css-block.js';
import {
  type CssImportOptions,
  filterManagedImports,
  generateCssImports,
} from '../utils/format.js';

const INIT_MODES: readonly InitMode[] = ['standalone', 'portable', 'tailwind'] as const;

export function registerUpdateCommand(program: Command): void {
  program
    .command('update')
    .description('Update CSS mode — rewrites the managed block in your CSS file')
    .option('--mode <mode>', `New CSS mode: ${INIT_MODES.join(', ')}`)
    .option('--scope', 'Add styles/scope.css import')
    .option('--baseline', 'Add styles/baseline.css import')
    .option('--layer', 'Use layer-wrapped CSS variant')
    .option('--write', 'Apply changes (without this flag, shows diff preview)')
    .option('--json', 'Output as JSON')
    .action(
      (opts: {
        mode?: string;
        scope?: boolean;
        baseline?: boolean;
        layer?: boolean;
        write?: boolean;
        json?: boolean;
      }) => {
        const cwd = process.cwd();

        // 1. Load config
        const configResult = loadConfig(cwd);
        if (!configResult) {
          console.error(c.error('No hareru.json found.'));
          console.error('Run "hareru init --write" first to set up your project.');
          process.exitCode = 1;
          return;
        }
        if (configResult.error) {
          console.error(c.error(configResult.error));
          process.exitCode = 1;
          return;
        }

        const { config, configDir, configPath } = configResult;

        // 2. Resolve CSS file (rejects path traversal)
        let cssFilePath: string;
        try {
          cssFilePath = resolveCssFilePath(configDir, config.cssFile);
        } catch (err) {
          console.error(c.error((err as Error).message));
          process.exitCode = 1;
          return;
        }
        if (!existsSync(cssFilePath)) {
          console.error(c.error(`CSS file not found: ${c.path(cssFilePath)}`));
          console.error(`Update cssFile in ${configPath} or run "hareru init --write" again.`);
          process.exitCode = 1;
          return;
        }

        // 3. Read CSS file and find managed block
        const cssContent = readFileSync(cssFilePath, 'utf-8');
        const block = findManagedBlock(cssContent);
        if (!block) {
          console.error(c.error('No managed block found in CSS file.'));
          console.error('Run "hareru init --write" first to create a managed block.');
          process.exitCode = 1;
          return;
        }

        // 4. Validate mode
        if (opts.mode === 'per-component') {
          console.error(c.error('per-component mode is not supported with update.'));
          console.error('Use "hareru add <component> --write" to add individual component CSS.');
          process.exitCode = 1;
          return;
        }

        if (opts.mode && !INIT_MODES.includes(opts.mode as InitMode)) {
          console.error(
            c.error(`Invalid mode "${opts.mode}". Valid modes: ${INIT_MODES.join(', ')}`),
          );
          process.exitCode = 1;
          return;
        }

        // 5. Determine new mode and options
        const newMode = (opts.mode as InitMode) ?? config.mode;
        const newOptions: CssImportOptions = {
          mode: newMode,
          scope: opts.scope ?? config.options?.scope,
          baseline: opts.baseline ?? config.options?.baseline,
          layer: opts.layer ?? config.options?.layer,
        };

        // 6. Generate new imports
        const { imports: cssImports, warnings } = generateCssImports(newOptions);
        const newManagedImports = filterManagedImports(cssImports);

        // 7. Check for unmanaged @hareru/ imports (before noChange to always report)
        const unmanagedImports = findUnmanagedHareruImports(cssContent);

        // 8. Tailwind validation (before noChange to always report)
        const tailwindWarnings: string[] = [];
        if (newMode === 'tailwind') {
          const tailwindImport = findTailwindImport(cssContent);
          if (!tailwindImport) {
            tailwindWarnings.push(
              `@import 'tailwindcss' not found in ${cssFilePath}\n  Add this line after the managed block for Tailwind CSS to work.`,
            );
          } else if (tailwindImport.index < block.startLine) {
            tailwindWarnings.push(
              `@import 'tailwindcss' (line ${tailwindImport.index + 1}) is before the managed block.\n  The @layer declaration must come before tailwindcss import.\n  Move it after the managed block, or re-order manually.`,
            );
          }
        }

        // 9. Compare with existing block
        const oldImports = block.lines.slice(1, -1).map((l) => l.trimEnd()); // exclude markers
        const noChange =
          oldImports.length === newManagedImports.length &&
          oldImports.every((line, i) => line === newManagedImports[i]);

        if (noChange) {
          if (opts.write) {
            try {
              updateConfig(configPath, {
                mode: newMode,
                options: {
                  scope: newOptions.scope,
                  baseline: newOptions.baseline,
                  layer: newOptions.layer,
                },
              });
            } catch (err) {
              console.error(c.error((err as Error).message));
              process.exitCode = 1;
              return;
            }
          }
          const allWarnings = [...warnings, ...tailwindWarnings];
          if (opts.json) {
            const result: Record<string, unknown> = {
              status: 'no-change',
              mode: newMode,
              warnings: allWarnings,
            };
            if (unmanagedImports.length > 0) {
              result.unmanagedImports = unmanagedImports.map((i) => ({
                line: i.index + 1,
                text: i.text.trim(),
              }));
            }
            console.log(JSON.stringify(result, null, 2));
          } else {
            console.log(c.info('No changes needed. Mode and imports are already up to date.'));
            for (const tw of allWarnings) {
              console.log(`${c.warning('Warning:')} ${tw}`);
            }
            if (unmanagedImports.length > 0) {
              console.log(
                `${c.warning('Warning:')} Unmanaged Hareru imports found outside the managed block:`,
              );
              for (const imp of unmanagedImports) {
                console.log(`  ${c.dim(`Line ${imp.index + 1}:`)} ${imp.text.trim()}`);
              }
            }
          }
          return;
        }

        // Dry-run JSON
        if (opts.json && !opts.write) {
          const result: Record<string, unknown> = {
            currentMode: config.mode,
            newMode,
            cssFile: cssFilePath,
            removed: oldImports,
            added: newManagedImports,
            warnings: [...warnings, ...tailwindWarnings],
            action: 'dry-run',
          };
          if (unmanagedImports.length > 0) {
            result.unmanagedImports = unmanagedImports.map((i) => ({
              line: i.index + 1,
              text: i.text.trim(),
            }));
          }
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        // Dry-run text
        if (!opts.write) {
          console.log(`${c.dim('Current mode:')} ${config.mode}`);
          console.log(`${c.dim('New mode:')}     ${newMode}`);
          console.log('');

          if (warnings.length > 0) {
            for (const w of warnings) {
              console.log(`${c.warning('Warning:')} ${w}`);
            }
            console.log('');
          }

          console.log(`Changes to ${c.path(cssFilePath)} (inside managed block):`);
          console.log('');

          // Show removals
          const removed = oldImports.filter((line) => !newManagedImports.includes(line));
          if (removed.length > 0) {
            console.log('  Remove:');
            for (const line of removed) {
              console.log(`  ${c.error(`- ${line}`)}`);
            }
            console.log('');
          }

          // Show additions
          const added = newManagedImports.filter((line) => !oldImports.includes(line));
          if (added.length > 0) {
            console.log('  Add:');
            for (const line of added) {
              console.log(`  ${c.success(`+ ${line}`)}`);
            }
            console.log('');
          }

          for (const tw of tailwindWarnings) {
            console.log(`${c.warning('Warning:')} ${tw}`);
            console.log('');
          }

          if (unmanagedImports.length > 0) {
            console.log(
              `${c.warning('Warning:')} Unmanaged Hareru imports found outside the managed block:`,
            );
            for (const imp of unmanagedImports) {
              console.log(`  ${c.dim(`Line ${imp.index + 1}:`)} ${imp.text.trim()}`);
            }
            console.log('');
            console.log('These imports are NOT managed by the CLI and will not be updated.');
            console.log('To adopt them, run: hareru init --write --force');
            console.log('');
          }

          console.log(`Run with ${c.bold('--write')} to apply.`);
          return;
        }

        // --write mode: perform write first, then emit output
        try {
          replaceManagedBlock(cssFilePath, newManagedImports);
        } catch (err) {
          console.error(c.error((err as Error).message));
          process.exitCode = 1;
          return;
        }

        try {
          updateConfig(configPath, {
            mode: newMode,
            options: {
              scope: newOptions.scope,
              baseline: newOptions.baseline,
              layer: newOptions.layer,
            },
          });
        } catch (err) {
          console.error(
            `${c.error('CSS was updated but hareru.json update failed:')} ${(err as Error).message}`,
          );
          process.exitCode = 1;
          return;
        }

        // Write-result JSON (emitted AFTER successful write)
        if (opts.json) {
          const result: Record<string, unknown> = {
            currentMode: config.mode,
            newMode,
            cssFile: cssFilePath,
            removed: oldImports,
            added: newManagedImports,
            warnings: [...warnings, ...tailwindWarnings],
            action: 'applied',
          };
          if (unmanagedImports.length > 0) {
            result.unmanagedImports = unmanagedImports.map((i) => ({
              line: i.index + 1,
              text: i.text.trim(),
            }));
          }
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        // Write-result text
        console.log(
          `${c.success('Updated')} ${c.path(cssFilePath)} (${config.mode} -> ${newMode})`,
        );

        if (warnings.length > 0) {
          for (const w of warnings) {
            console.log(`${c.warning('Warning:')} ${w}`);
          }
        }

        for (const tw of tailwindWarnings) {
          console.log(`${c.warning('Warning:')} ${tw}`);
        }

        if (unmanagedImports.length > 0) {
          console.log('');
          console.log(
            `${c.warning('Warning:')} Unmanaged Hareru imports found outside the managed block:`,
          );
          for (const imp of unmanagedImports) {
            console.log(`  ${c.dim(`Line ${imp.index + 1}:`)} ${imp.text.trim()}`);
          }
          console.log('');
          console.log('These imports are NOT managed by the CLI and will not be updated.');
          console.log('To adopt them, run: hareru init --write --force');
        }
      },
    );
}
