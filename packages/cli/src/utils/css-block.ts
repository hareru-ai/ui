import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export const MARKER_START = '/* hareru:start managed */';
export const MARKER_END = '/* hareru:end */';

export interface ManagedBlock {
  startLine: number;
  endLine: number;
  lines: string[];
}

/**
 * Find the managed block markers in CSS content.
 */
export function findManagedBlock(content: string): ManagedBlock | null {
  const lines = content.split('\n');
  let startLine = -1;
  let endLine = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === MARKER_START) {
      startLine = i;
    }
    if (lines[i].trim() === MARKER_END && startLine >= 0) {
      endLine = i;
      break;
    }
  }

  if (startLine < 0 || endLine < 0) return null;

  return {
    startLine,
    endLine,
    lines: lines.slice(startLine, endLine + 1),
  };
}

/**
 * Find @hareru/ imports outside the managed block.
 */
export function findUnmanagedHareruImports(content: string): { index: number; text: string }[] {
  const lines = content.split('\n');
  const block = findManagedBlock(content);
  const results: { index: number; text: string }[] = [];
  let inComment = false;

  for (let i = 0; i < lines.length; i++) {
    // Skip lines inside managed block
    if (block && i >= block.startLine && i <= block.endLine) continue;

    const line = lines[i];
    // Track multiline CSS comments (/* ... */)
    if (inComment) {
      if (line.includes('*/')) inComment = false;
      continue;
    }
    // Check if this line contains a comment block (anywhere in the line)
    if (line.includes('/*')) {
      if (line.includes('*/')) {
        // Single-line comment: strip /* ... */ and check remaining text
        // Handles both: `@import '...'; /* note */` and `/* note */ @import '...'`
        const stripped = line.replace(/\/\*.*?\*\//g, '');
        if (/@import\s+['"]@hareru\//.test(stripped)) {
          results.push({ index: i, text: line });
        }
        continue;
      }
      // Multiline comment starts here — skip this line and enter comment mode
      inComment = true;
      continue;
    }
    if (/@import\s+['"]@hareru\//.test(line)) {
      results.push({ index: i, text: line });
    }
  }

  return results;
}

/**
 * Find @layer declarations that contain 'hui' (migration check).
 */
export function findLayerHuiDeclarations(content: string): { index: number; text: string }[] {
  const lines = content.split('\n');
  const block = findManagedBlock(content);
  const results: { index: number; text: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    // Skip lines inside managed block
    if (block && i >= block.startLine && i <= block.endLine) continue;

    // Match @layer declarations that include 'hui' as a layer name (allow leading whitespace)
    if (/^\s*@layer\s+.*\bhui\b/.test(lines[i])) {
      results.push({ index: i, text: lines[i] });
    }
  }

  return results;
}

/**
 * Find @import 'tailwindcss' in CSS content.
 */
export function findTailwindImport(content: string): { index: number; text: string } | null {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*@import\s+['"]tailwindcss['"]/.test(lines[i])) {
      return { index: i, text: lines[i] };
    }
  }

  return null;
}

/**
 * Write a managed block to a CSS file.
 * Inserts at file start (after @charset if present).
 */
export function writeManagedBlock(
  filePath: string,
  imports: string[],
  options: {
    force?: boolean;
    adoptLines?: { index: number; text: string }[];
    removeLayerHui?: { index: number; text: string }[];
  } = {},
): {
  filePath: string;
  added: string[];
  adopted: string[];
  replaced: boolean;
} {
  const content = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';
  let lines = content.split('\n');

  // Handle empty file (just newline)
  if (lines.length === 1 && lines[0] === '') {
    lines = [];
  }

  const existingBlock = findManagedBlock(content);
  let replaced = false;
  const adopted: string[] = [];

  // If block exists
  if (existingBlock) {
    if (!options.force) {
      return { filePath, added: [], adopted: [], replaced: false };
    }
    // Remove existing block
    lines.splice(existingBlock.startLine, existingBlock.endLine - existingBlock.startLine + 1);
    replaced = true;
  }

  // Collect line indices to remove (adopt + force layer hui)
  const removeIndices = new Set<number>();

  if (options.adoptLines) {
    for (const line of options.adoptLines) {
      removeIndices.add(line.index);
      adopted.push(line.text);
    }
  }

  if (options.removeLayerHui) {
    for (const line of options.removeLayerHui) {
      removeIndices.add(line.index);
    }
  }

  // Remove lines in reverse order to preserve indices
  if (removeIndices.size > 0) {
    const sorted = [...removeIndices].sort((a, b) => b - a);
    for (const idx of sorted) {
      // Lines inside [startLine, endLine] are never returned by find* functions.
      // Only lines after endLine need adjustment after block removal.
      const blockSize = existingBlock ? existingBlock.endLine - existingBlock.startLine + 1 : 0;
      const adjustedIdx = existingBlock && idx > existingBlock.endLine ? idx - blockSize : idx;
      if (adjustedIdx >= 0 && adjustedIdx < lines.length) {
        lines.splice(adjustedIdx, 1);
      }
    }
  }

  // Build new block
  const blockLines = [MARKER_START, ...imports, MARKER_END];

  // Find insert position: after @charset if present, otherwise at start
  let insertAt = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^@charset\s+/.test(lines[i])) {
      insertAt = i + 1;
      break;
    }
  }

  // Insert block with trailing newline
  lines.splice(insertAt, 0, ...blockLines, '');

  writeFileSync(filePath, lines.join('\n'));

  return {
    filePath,
    added: imports,
    adopted,
    replaced,
  };
}

/**
 * Replace the content inside an existing managed block.
 */
export function replaceManagedBlock(
  filePath: string,
  newImports: string[],
): {
  filePath: string;
  removed: string[];
  added: string[];
} {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const block = findManagedBlock(content);
  if (!block) {
    throw new Error('No managed block found. Run "hareru init --write" first.');
  }

  // Extract old imports (lines between markers, excluding markers)
  const removed = block.lines.slice(1, -1);

  // Replace block content
  const newBlockLines = [MARKER_START, ...newImports, MARKER_END];
  lines.splice(block.startLine, block.endLine - block.startLine + 1, ...newBlockLines);

  writeFileSync(filePath, lines.join('\n'));

  return {
    filePath,
    removed,
    added: newImports,
  };
}
