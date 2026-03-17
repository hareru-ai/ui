import { readFileSync } from 'node:fs';

export interface FrameworkDetection {
  framework: 'next' | 'vite' | 'remix' | 'astro' | 'unknown';
  hasTailwind: boolean;
  hasExistingReset: boolean;
}

export function detectFramework(pkgJsonPath: string): FrameworkDetection {
  let pkg: Record<string, Record<string, string>>;
  try {
    pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  } catch {
    return { framework: 'unknown', hasTailwind: false, hasExistingReset: false };
  }

  // Only check dependencies and devDependencies — peerDependencies express
  // compatibility intent, not actual availability in node_modules
  const allDeps: Record<string, string> = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  // Framework detection (order matters — most specific first)
  let framework: FrameworkDetection['framework'] = 'unknown';
  if ('next' in allDeps) {
    framework = 'next';
  } else if ('@remix-run/react' in allDeps) {
    framework = 'remix';
  } else if ('astro' in allDeps) {
    framework = 'astro';
  } else if ('vite' in allDeps) {
    framework = 'vite';
  }

  const hasTailwind = 'tailwindcss' in allDeps;

  const hasExistingReset =
    'normalize.css' in allDeps ||
    'modern-normalize' in allDeps ||
    'bootstrap' in allDeps ||
    'sanitize.css' in allDeps;

  return { framework, hasTailwind, hasExistingReset };
}
