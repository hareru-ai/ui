import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { recommendCssMode } from '@hareru/registry';
import type { Command } from 'commander';
import { c } from '../utils/colors.js';
import type { HareruConfig, InitMode } from '../utils/config.js';
import { writeConfig } from '../utils/config.js';
import {
  findLayerHuiDeclarations,
  findManagedBlock,
  findTailwindImport,
  findUnmanagedHareruImports,
  writeManagedBlock,
} from '../utils/css-block.js';
import { detectCssFile } from '../utils/css-detector.js';
import {
  type CssImportOptions,
  type CssMode,
  filterManagedImports,
  generateCssImports,
} from '../utils/format.js';
import { type FrameworkDetection, detectFramework } from '../utils/framework-detector.js';
import { detectPackage } from '../utils/pkg-detector.js';

const INIT_MODES: readonly InitMode[] = ['standalone', 'portable', 'tailwind'] as const;

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize Hareru UI in your project — generates config and CSS imports')
    .option('--mode <mode>', `CSS mode: ${INIT_MODES.join(', ')}`)
    .option('--css-file <path>', 'CSS file to write imports to (auto-detected if omitted)')
    .option('--framework <fw>', 'Framework: next, vite, remix, astro (auto-detected if omitted)')
    .option('--write', 'Apply changes (without this flag, shows dry-run preview)')
    .option('--scope', 'Add styles/scope.css import')
    .option('--baseline', 'Add styles/baseline.css import')
    .option('--layer', 'Use layer-wrapped CSS variant')
    .option('--force', 'Overwrite existing config and managed block')
    .option('--json', 'Output as JSON')
    .action(
      (opts: {
        mode?: string;
        cssFile?: string;
        framework?: string;
        write?: boolean;
        scope?: boolean;
        baseline?: boolean;
        layer?: boolean;
        force?: boolean;
        json?: boolean;
      }) => {
        const cwd = process.cwd();

        // 1. Detect package
        const pkg = detectPackage(cwd);

        if (!pkg.found) {
          console.error(c.error('No package.json found.'));
          console.error('Initialize a project first (e.g., npm init).');
          process.exitCode = 1;
          return;
        }

        if (pkg.parseError) {
          console.error(c.error(pkg.parseError));
          console.error('Fix your package.json before running init.');
          process.exitCode = 1;
          return;
        }

        // pkg.found is true here (checked above), so pkgJsonPath is guaranteed
        const pkgJsonPath = pkg.pkgJsonPath as string;
        const configDir = dirname(pkgJsonPath);

        // 2. Framework validation + detection
        const VALID_FRAMEWORKS = ['next', 'vite', 'remix', 'astro'] as const;
        if (
          opts.framework &&
          !VALID_FRAMEWORKS.includes(opts.framework as (typeof VALID_FRAMEWORKS)[number])
        ) {
          console.error(
            c.error(`Invalid framework "${opts.framework}". Valid: ${VALID_FRAMEWORKS.join(', ')}`),
          );
          process.exitCode = 1;
          return;
        }
        const detected = detectFramework(pkgJsonPath);
        const fw = opts.framework
          ? { ...detected, framework: opts.framework as FrameworkDetection['framework'] }
          : detected;

        // 3. Mode validation
        if (opts.mode === 'per-component') {
          console.error(c.error('per-component mode is not supported with init.'));
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

        // 4. Determine mode
        let mode: InitMode;
        let modeReason: string;
        if (opts.mode) {
          mode = opts.mode as InitMode;
          modeReason = 'specified via --mode';
        } else {
          const rec = recommendCssMode({
            hasTailwind: fw.hasTailwind,
            hasExistingReset: fw.hasExistingReset,
            componentCount: 0,
          });
          // recommendCssMode might return per-component for 0 components, override to standalone
          if (rec.mode === 'per-component') {
            mode = 'standalone';
            modeReason = 'default (standalone provides the simplest setup)';
          } else {
            mode = rec.mode as InitMode;
            modeReason = rec.reason;
          }
        }

        // 5. CSS file resolution
        let cssFilePath: string;
        if (opts.cssFile) {
          cssFilePath = resolve(cwd, opts.cssFile);
        } else {
          const detected = detectCssFile(configDir);
          if (detected) {
            cssFilePath = detected;
          } else {
            console.error(c.error('Could not find a CSS file.'));
            console.error(`Use ${c.bold('--css-file <path>')} to specify one.`);
            process.exitCode = 1;
            return;
          }
        }

        // 6. Generate CSS imports
        const importOptions: CssImportOptions = {
          mode,
          layer: opts.layer,
          scope: opts.scope,
          baseline: opts.baseline,
        };
        const { imports: cssImports, warnings } = generateCssImports(importOptions);
        const managedImports = filterManagedImports(cssImports);

        // 7. Analyze existing CSS file
        const cssContent = existsSync(cssFilePath) ? readFileSync(cssFilePath, 'utf-8') : '';

        const existingBlock = findManagedBlock(cssContent);
        const unmanagedImports = findUnmanagedHareruImports(cssContent);
        const layerHuiDecls = findLayerHuiDeclarations(cssContent);
        const tailwindImport = findTailwindImport(cssContent);

        // 8. Determine adopt/migration strategy
        let action: 'new' | 'skip' | 'adopt' | 'migration-error' = 'new';
        if (layerHuiDecls.length > 0 && unmanagedImports.length > 0 && !opts.force) {
          action = 'migration-error';
        } else if (existingBlock && !opts.force) {
          action = 'skip';
        } else if (unmanagedImports.length > 0 && !existingBlock) {
          action = 'adopt';
        }

        // Handle migration error
        if (action === 'migration-error') {
          const lines = layerHuiDecls.map((d) => `  Line ${d.index + 1}: ${d.text.trim()}`);
          console.error(c.error('Existing Tailwind + Hareru setup detected:'));
          for (const line of lines) {
            console.error(line);
          }
          console.error('');
          console.error('Automatic migration is not supported for this configuration.');
          console.error('');
          console.error('Manual migration steps:');
          console.error('  1. Remove existing @layer and @hareru/ imports');
          console.error(`  2. Run: hareru init --write --mode ${mode}`);
          console.error("  3. Ensure @import 'tailwindcss' comes after the managed block");
          console.error('');
          console.error(
            `Or use ${c.bold('--force')} to overwrite (existing @hareru imports will be removed).`,
          );
          process.exitCode = 1;
          return;
        }

        // Handle skip
        if (action === 'skip') {
          if (opts.json) {
            console.log(
              JSON.stringify(
                {
                  status: 'skipped',
                  reason: 'Managed block already exists. Use --force to overwrite.',
                },
                null,
                2,
              ),
            );
          } else {
            console.log(c.info('Managed block already exists. Use --force to overwrite.'));
          }
          return;
        }

        // 9. Tailwind validation (--write only, tailwind mode)
        const tailwindWarnings: string[] = [];
        if (mode === 'tailwind' && opts.write) {
          if (!tailwindImport) {
            tailwindWarnings.push(
              `@import 'tailwindcss' not found in ${cssFilePath}\n  Add this line after the managed block for Tailwind CSS to work.`,
            );
          } else if (existingBlock && tailwindImport.index < existingBlock.startLine) {
            tailwindWarnings.push(
              `@import 'tailwindcss' (line ${tailwindImport.index + 1}) is before the managed block.\n  The @layer declaration must come before tailwindcss import.\n  Move it after the managed block, or re-order manually.`,
            );
          }
        }

        // 10. Check existing config
        const configPath = resolve(configDir, 'hareru.json');
        const hasExistingConfig = existsSync(configPath);

        // 11. Deps check
        const depsInstalled = pkg.installed.tokens && pkg.installed.ui;

        // Dry-run JSON: emit and return
        if (opts.json && !opts.write) {
          const result: Record<string, unknown> = {
            mode,
            modeReason,
            framework: fw.framework,
            cssFile: cssFilePath,
            managedImports,
            action: 'dry-run',
            warnings: [...warnings, ...tailwindWarnings],
            depsInstalled,
          };
          if (!depsInstalled) {
            result.installCommand = pkg.installCommand;
          }
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        // Dry-run text output
        if (!opts.write) {
          console.log(`${c.heading('hareru init')} preview\n`);
          console.log(`${c.dim('Mode:')}      ${mode} (${modeReason})`);
          console.log(`${c.dim('Framework:')} ${fw.framework}`);
          console.log(`${c.dim('CSS file:')}  ${cssFilePath}`);
          console.log('');

          if (warnings.length > 0) {
            for (const w of warnings) {
              console.log(`${c.warning('Warning:')} ${w}`);
            }
            console.log('');
          }

          console.log(`${c.heading('Managed block')} (will be added to CSS file):`);
          console.log(`  ${c.dim('/* hareru:start managed */')}`);
          for (const imp of managedImports) {
            console.log(`  ${imp}`);
          }
          console.log(`  ${c.dim('/* hareru:end */')}`);
          console.log('');

          if (action === 'adopt') {
            console.log(`${c.info('Will adopt')} existing @hareru/ imports into managed block:`);
            for (const imp of unmanagedImports) {
              console.log(`  ${c.dim(`Line ${imp.index + 1}:`)} ${imp.text.trim()}`);
            }
            console.log('');
          }

          if (hasExistingConfig && !opts.force) {
            console.log(
              `${c.warning('Warning:')} hareru.json already exists. Use --force to overwrite.`,
            );
            console.log('');
          }

          if (!depsInstalled) {
            console.log(`${c.warning('Warning:')} Dependencies not installed. After init, run:`);
            console.log(`  ${pkg.installCommand}`);
            console.log('');
          }

          console.log(`Run with ${c.bold('--write')} to apply.`);
          return;
        }

        // --write mode
        let blockResult: ReturnType<typeof writeManagedBlock>;
        try {
          // Adopt unmanaged imports when action is 'adopt' or when --force is used
          const shouldAdopt = unmanagedImports.length > 0 && (action === 'adopt' || opts.force);
          blockResult = writeManagedBlock(cssFilePath, managedImports, {
            force: opts.force,
            adoptLines: shouldAdopt ? unmanagedImports : undefined,
            removeLayerHui: opts.force ? layerHuiDecls : undefined,
          });
        } catch (err) {
          const e = err as NodeJS.ErrnoException;
          if (e.code === 'ENOENT') {
            console.error(`${c.error('File not found:')} ${c.path(cssFilePath)}`);
          } else if (e.code === 'EACCES') {
            console.error(`${c.error('Permission denied:')} ${c.path(cssFilePath)}`);
          } else {
            console.error(`${c.error('Failed to write CSS:')} ${e.message}`);
          }
          process.exitCode = 1;
          return;
        }

        // Write config
        let configWritten = true;
        if (hasExistingConfig && !opts.force) {
          configWritten = false;
          if (!opts.json) {
            console.log(
              `${c.warning('Warning:')} hareru.json already exists. Skipping config write. Use --force to overwrite.`,
            );
          }
        } else {
          try {
            writeConfig(
              cwd,
              {
                mode,
                framework: fw.framework as HareruConfig['framework'],
                options:
                  importOptions.scope || importOptions.baseline || importOptions.layer
                    ? {
                        scope: importOptions.scope,
                        baseline: importOptions.baseline,
                        layer: importOptions.layer,
                      }
                    : undefined,
              },
              cssFilePath,
            );
          } catch (err) {
            console.error(`${c.error('Failed to write hareru.json:')} ${(err as Error).message}`);
            process.exitCode = 1;
            return;
          }
        }

        // Write-result JSON (emitted AFTER successful write)
        if (opts.json) {
          const jsonResult: Record<string, unknown> = {
            mode,
            modeReason,
            framework: fw.framework,
            cssFile: cssFilePath,
            managedImports,
            action: action === 'adopt' ? 'adopt' : existingBlock ? 'replace' : 'create',
            warnings: [...warnings, ...tailwindWarnings],
            depsInstalled,
            configWritten,
            added: blockResult.added,
            adopted: blockResult.adopted,
            replaced: blockResult.replaced,
          };
          if (!depsInstalled) jsonResult.installCommand = pkg.installCommand;
          console.log(JSON.stringify(jsonResult, null, 2));
          return;
        }

        // Write-result text output
        if (blockResult.added.length > 0) {
          console.log(`${c.success('Wrote managed block to')} ${c.path(cssFilePath)}`);
          if (blockResult.replaced) {
            console.log(c.dim('  (replaced existing block)'));
          }
        }

        if (blockResult.adopted.length > 0) {
          console.log(
            `${c.info('Adopted')} ${blockResult.adopted.length} existing import(s) into managed block.`,
          );
        }

        if (warnings.length > 0) {
          for (const w of warnings) {
            console.log(`${c.warning('Warning:')} ${w}`);
          }
        }

        for (const tw of tailwindWarnings) {
          console.log(`${c.warning('Warning:')} ${tw}`);
        }

        if (!depsInstalled) {
          console.log('');
          console.log(`${c.warning('Warning:')} Dependencies not installed. Run:`);
          console.log(`  ${pkg.installCommand}`);
        }

        // Framework-specific guidance
        if (fw.framework === 'next') {
          console.log('');
          console.log(`${c.dim('Next.js:')} Import the CSS file in your layout.tsx or _app.tsx.`);
        }
      },
    );
}
