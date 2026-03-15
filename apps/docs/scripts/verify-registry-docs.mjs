#!/usr/bin/env node

/**
 * verify-registry-docs.mjs
 *
 * Ensures every component with registry data (states, a11y, slots) has the
 * corresponding <Registry*> tag and ## heading in its MDX page.
 *
 * This catches "registry has data but MDX has no tag" errors — a class that
 * getComponentOrThrow (which catches name typos at SSG time) does not cover.
 */

// NOTE: hasStatesContent / hasA11yContent / hasSlotsContent logic is duplicated
// in lib/registry.ts — keep in sync

import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsRoot = join(__dirname, '..');
const componentsDir = join(docsRoot, 'content', 'docs', 'components');

// ---------------------------------------------------------------------------
// Load registry
// ---------------------------------------------------------------------------

const registryPath = require.resolve('@hareru/ui/component-registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));

// ---------------------------------------------------------------------------
// Content helpers (keep in sync with lib/registry.ts)
// ---------------------------------------------------------------------------

function hasStatesContent(states) {
  return !!(states && states.length > 0);
}

function hasA11yContent(a11y) {
  if (!a11y) return false;
  return !!(
    a11y.roles?.length ||
    a11y.ariaAttributes?.length ||
    a11y.semanticElements?.length ||
    a11y.keyboardInteractions?.length ||
    a11y.liveRegion ||
    a11y.notes?.trim()
  );
}

function hasSlotsContent(slots) {
  return !!(slots && slots.length > 0);
}

// ---------------------------------------------------------------------------
// Parse MDX frontmatter title
// ---------------------------------------------------------------------------

function extractTitle(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const titleMatch = fmMatch[1].match(/^title:\s*(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : null;
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

const errors = [];

// Build lookup: title → MDX content
const mdxFiles = readdirSync(componentsDir).filter((f) => f.endsWith('.mdx') && f !== 'index.mdx');

const mdxByTitle = new Map();

for (const file of mdxFiles) {
  // Normalize CRLF → LF for cross-platform compatibility
  const content = readFileSync(join(componentsDir, file), 'utf-8').replace(/\r\n/g, '\n');
  const title = extractTitle(content);
  if (title) {
    if (mdxByTitle.has(title)) {
      errors.push(
        `Duplicate frontmatter title "${title}" in ${mdxByTitle.get(title).file} and ${file}`,
      );
    }
    mdxByTitle.set(title, { file, content });
  }
}

// ---------------------------------------------------------------------------
// Coverage checks: registry ↔ MDX title bijection
// ---------------------------------------------------------------------------

const registryNames = new Set(registry.components.map((c) => c.name));
const mdxTitles = new Set(mdxByTitle.keys());

// Every registry component must have a matching MDX page
for (const name of registryNames) {
  if (!mdxTitles.has(name)) {
    errors.push(
      `Registry component "${name}" has no matching MDX page (no .mdx file with title: ${name})`,
    );
  }
}

// Every component MDX page title must exist in registry
for (const title of mdxTitles) {
  if (!registryNames.has(title)) {
    errors.push(
      `MDX page with title "${title}" has no matching registry component (typo or stale page?)`,
    );
  }
}

// ---------------------------------------------------------------------------
// Per-component tag/heading checks
// ---------------------------------------------------------------------------

for (const entry of registry.components) {
  const mdx = mdxByTitle.get(entry.name);
  if (!mdx) {
    // Already reported above
    continue;
  }

  const { file, content } = mdx;
  const checks = [
    {
      hasData: hasStatesContent(entry.states),
      tag: '<RegistryStates',
      heading: '## States',
      label: 'States',
    },
    {
      hasData: hasA11yContent(entry.a11y),
      tag: '<RegistryA11y',
      heading: '## Accessibility',
      label: 'Accessibility',
    },
    {
      hasData: hasSlotsContent(entry.slots),
      tag: '<RegistrySlots',
      heading: '## Structure',
      label: 'Structure',
    },
  ];

  for (const check of checks) {
    const hasTag = content.includes(check.tag);
    const hasHeading = new RegExp(`^${check.heading}$`, 'm').test(content);

    // 1. Data exists → tag + heading should exist
    if (check.hasData && !hasTag) {
      errors.push(
        `${file}: registry has ${check.label} data for "${entry.name}" but MDX is missing ${check.tag} tag`,
      );
    }

    // 2. No data → tag + heading should NOT exist (prevents empty TOC headings from null-rendered components)
    if (!check.hasData && hasTag) {
      errors.push(
        `${file}: registry has no ${check.label} data for "${entry.name}" but MDX contains ${check.tag} tag (would render nothing)`,
      );
    }
    if (!check.hasData && hasHeading) {
      errors.push(
        `${file}: registry has no ${check.label} data for "${entry.name}" but MDX contains "${check.heading}" heading (would be empty)`,
      );
    }

    // 3. Heading-tag pair: tag without heading or heading without tag
    if (hasTag && !hasHeading) {
      errors.push(`${file}: has ${check.tag} tag but missing "${check.heading}" heading`);
    }
    if (hasHeading && !hasTag) {
      errors.push(`${file}: has "${check.heading}" heading but missing ${check.tag} tag`);
    }
  }

  // 3. name-page consistency: each Registry tag's name prop should match the page title
  const tagPattern = /<Registry(?:States|A11y|Slots)\s+name="([^"]+)"/g;
  const matches = content.matchAll(tagPattern);
  for (const m of matches) {
    const tagName = m[1];
    if (tagName !== entry.name) {
      errors.push(`${file}: ${m[0]} has name="${tagName}" but page title is "${entry.name}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (errors.length > 0) {
  console.error('\n❌ verify-registry-docs: found issues:\n');
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  console.error(`\n  Total: ${errors.length} error(s)\n`);
  process.exit(1);
} else {
  console.log('✅ verify-registry-docs: all registry tags verified');
}
