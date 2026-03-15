import { existsSync, readFileSync } from 'node:fs';
import { join, parse } from 'node:path';

export interface PkgDetectionResult {
  found: boolean;
  pkgJsonPath: string | null;
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
  installed: { tokens: boolean; ui: boolean };
  installCommand: string;
  parseError?: string;
}

export function detectPackage(cwd: string): PkgDetectionResult {
  const pkgJsonPath = findUp('package.json', cwd);

  if (!pkgJsonPath) {
    return {
      found: false,
      pkgJsonPath: null,
      packageManager: 'npm',
      installed: { tokens: false, ui: false },
      installCommand: 'npm install @hareru/tokens @hareru/ui',
    };
  }

  const pkgDir = join(pkgJsonPath, '..');
  // Search for lockfiles upward from the package.json directory (monorepo support)
  const pm = detectPackageManager(pkgDir);

  let pkg: Record<string, Record<string, string>>;
  try {
    pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  } catch (err) {
    return {
      found: true,
      pkgJsonPath,
      packageManager: pm,
      installed: { tokens: false, ui: false },
      installCommand: formatInstallCommand(pm, ['@hareru/tokens', '@hareru/ui']),
      parseError: `Failed to parse ${pkgJsonPath}: ${(err as Error).message}`,
    };
  }

  // Only check dependencies and devDependencies — peerDependencies express
  // compatibility intent, not actual availability in node_modules
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  const tokensInstalled = '@hareru/tokens' in allDeps;
  const uiInstalled = '@hareru/ui' in allDeps;

  const missing: string[] = [];
  if (!tokensInstalled) missing.push('@hareru/tokens');
  if (!uiInstalled) missing.push('@hareru/ui');

  return {
    found: true,
    pkgJsonPath,
    packageManager: pm,
    installed: { tokens: tokensInstalled, ui: uiInstalled },
    installCommand: missing.length > 0 ? formatInstallCommand(pm, missing) : '',
  };
}

function findUp(filename: string, startDir: string): string | null {
  let dir = startDir;
  while (true) {
    const candidate = join(dir, filename);
    if (existsSync(candidate)) return candidate;
    const parent = join(dir, '..');
    if (parent === dir || dir === parse(dir).root) return null;
    dir = parent;
  }
}

function detectPackageManager(startDir: string): 'npm' | 'pnpm' | 'yarn' | 'bun' {
  // Walk up from startDir to find the nearest lockfile (monorepo-aware)
  let dir = startDir;
  while (true) {
    if (existsSync(join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
    if (existsSync(join(dir, 'yarn.lock'))) return 'yarn';
    if (existsSync(join(dir, 'bun.lockb')) || existsSync(join(dir, 'bun.lock'))) return 'bun';
    const parent = join(dir, '..');
    if (parent === dir || dir === parse(dir).root) break;
    dir = parent;
  }
  return 'npm';
}

function formatInstallCommand(pm: 'npm' | 'pnpm' | 'yarn' | 'bun', packages: string[]): string {
  const pkgs = packages.join(' ');
  switch (pm) {
    case 'pnpm':
      return `pnpm add ${pkgs}`;
    case 'yarn':
      return `yarn add ${pkgs}`;
    case 'bun':
      return `bun add ${pkgs}`;
    default:
      return `npm install ${pkgs}`;
  }
}
