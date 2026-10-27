import {
  closeSync,
  constants,
  fstatSync,
  ftruncateSync,
  lstatSync,
  openSync,
  realpathSync,
  type Stats,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

function isWithin(root: string, path: string): boolean {
  const rel = relative(root, path);
  return rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

/** Resolve existing ancestors even when the destination file has not been created. */
function canonicalPath(path: string): string {
  const missing: string[] = [];
  let ancestor = path;
  while (!lstatSync(ancestor, { throwIfNoEntry: false })) {
    missing.unshift(basename(ancestor));
    const parent = dirname(ancestor);
    if (parent === ancestor) throw new Error(`Cannot resolve path: ${path}`);
    ancestor = parent;
  }
  // lstat sees dangling symlinks; realpath rejects them instead of treating them as new files.
  return join(realpathSync(ancestor), ...missing);
}

/** Keep resolved destinations inside the project, including symlink targets. */
export function resolveProjectPath(projectDir: string, path: string, label = 'Path'): string {
  const root = resolve(projectDir);
  const target = resolve(root, path);
  const outside = `${label} "${path}" resolves outside the project root. Use a path within the project.`;
  // Canonicalize both sides: system aliases such as /var -> /private/var are valid.
  let canonicalTarget: string;
  try {
    canonicalTarget = canonicalPath(target);
  } catch (err) {
    throw new Error(`Cannot safely resolve ${label} "${path}": ${(err as Error).message}`);
  }
  if (!isWithin(realpathSync(root), canonicalTarget)) throw new Error(outside);
  return canonicalTarget;
}

function assertWritableFile(stat: Stats, path: string): void {
  if (!stat.isFile()) {
    throw new Error(`Refusing to write "${path}": destination must be a regular file.`);
  }
  if (stat.nlink > 1) {
    throw new Error(`Refusing to write "${path}": hard links are not allowed.`);
  }
}

/** Check existing destinations before starting a write that affects multiple files. */
export function assertWritableProjectFile(root: string, path: string, label: string): string {
  const target = resolveProjectPath(root, path, label);
  const stat = lstatSync(target, { throwIfNoEntry: false });
  if (stat) assertWritableFile(stat, path);
  return target;
}

/** Validate the opened file before truncating it, including its hard-link count. */
export function writeProjectFile(root: string, path: string, content: string): void {
  const target = resolveProjectPath(root, path);
  const fd = openSync(target, constants.O_WRONLY | constants.O_CREAT | (constants.O_NOFOLLOW ?? 0));
  try {
    assertWritableFile(fstatSync(fd), path);
    ftruncateSync(fd, 0);
    writeFileSync(fd, content, 'utf-8');
  } finally {
    closeSync(fd);
  }
}
