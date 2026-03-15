import { readFileSync, writeFileSync } from 'node:fs';

export interface CssWriteResult {
  filePath: string;
  added: string[];
  skipped: string[];
}

export function writeCssImports(filePath: string, imports: string[]): CssWriteResult {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Parse existing @import lines
  const importRegex = /^@import\s+['"]([^'"]+)['"]\s*;/;
  const existingSpecifiers = new Set<string>();
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(importRegex);
    if (match) {
      existingSpecifiers.add(match[1]);
      lastImportIndex = i;
    }
  }

  // Parse existing @layer declarations
  const layerRegex = /^@layer\s+/;
  let lastLayerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (layerRegex.test(lines[i])) {
      lastLayerIndex = i;
    }
  }

  const added: string[] = [];
  const skipped: string[] = [];

  // Separate @layer declarations and @import lines
  const layerLines: string[] = [];
  const importLines: string[] = [];

  for (const imp of imports) {
    if (imp.startsWith('@layer ')) {
      // Check if this @layer declaration already exists
      const exists = lines.some((line) => line.trim() === imp);
      if (exists) {
        skipped.push(imp);
      } else {
        layerLines.push(imp);
        added.push(imp);
      }
    } else {
      // Extract specifier from @import line
      const match = imp.match(/^@import\s+['"]([^'"]+)['"]\s*;/);
      if (match && existingSpecifiers.has(match[1])) {
        skipped.push(imp);
      } else {
        importLines.push(imp);
        added.push(imp);
      }
    }
  }

  if (added.length === 0) {
    return { filePath, added, skipped };
  }

  // Insert @layer declarations before any @import lines
  if (layerLines.length > 0) {
    const insertAt = lastLayerIndex >= 0 ? lastLayerIndex + 1 : 0;
    lines.splice(insertAt, 0, ...layerLines);
    // Adjust indices after insertion
    lastLayerIndex = insertAt + layerLines.length - 1;
    if (lastImportIndex >= insertAt) {
      lastImportIndex += layerLines.length;
    }
  }

  // Insert @import lines after the last existing @import, or after @layer declarations
  if (importLines.length > 0) {
    const insertAt =
      lastImportIndex >= 0 ? lastImportIndex + 1 : lastLayerIndex >= 0 ? lastLayerIndex + 1 : 0;
    lines.splice(insertAt, 0, ...importLines);
  }

  writeFileSync(filePath, lines.join('\n'));

  return { filePath, added, skipped };
}
