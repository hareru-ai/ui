import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * E2E tests for CSS distribution patterns.
 *
 * Validates that the 4 CSS consumption patterns produce correct styling
 * in a real browser environment.
 *
 * NOTE: All tests use page.setContent() with inline <style> tags rather than
 * page.addStyleTag(), because Chromium does not reliably process @layer
 * declarations added via addStyleTag after initial page load.
 */

const DIST = resolve('packages/ui/dist');
const TOKENS_DIST = resolve('packages/tokens/dist');

function readCSS(path: string): string {
  return readFileSync(path, 'utf-8');
}

function buildHTML(styles: string[], body: string): string {
  // Escape </style> in CSS content to prevent premature tag closure
  const styleTags = styles
    .map((s) => `<style>${s.replace(/<\/style>/gi, '<\\/style>')}</style>`)
    .join('\n');
  return `<!DOCTYPE html><html><head>${styleTags}</head><body>${body}</body></html>`;
}

const BUTTON_FIXTURE = `
<div class="hui-root">
  <button class="hui-button hui-button--default hui-button--md">Click me</button>
  <div class="hui-card">
    <div class="hui-card__header">
      <h3 class="hui-card__title">Title</h3>
    </div>
    <div class="hui-card__content">Content</div>
  </div>
</div>
`;

// --- Pattern A: Standalone ---
test.describe('Pattern A: standalone (styles.css)', () => {
  test('body gets font-family and .hui-button gets styled', async ({ page }) => {
    const css = readCSS(resolve(DIST, 'styles.css'));
    await page.setContent(buildHTML([css], BUTTON_FIXTURE), { waitUntil: 'networkidle' });

    const bodyFontFamily = await page.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue('font-family'),
    );
    expect(bodyFontFamily).toBeTruthy();
    expect(bodyFontFamily).not.toBe('');

    const btnDisplay = await page.evaluate(() => {
      const btn = document.querySelector('.hui-button');
      return btn ? getComputedStyle(btn).getPropertyValue('display') : null;
    });
    expect(btnDisplay).toBe('inline-flex');
  });
});

// --- Pattern B: Portable (tokens + components.css) ---
test.describe('Pattern B: portable (tokens + components.css)', () => {
  test('body has NO font-family from hareru, .hui-button gets styled', async ({ page }) => {
    const tokensCss = readCSS(resolve(TOKENS_DIST, 'theme.css'));
    const componentsCss = readCSS(resolve(DIST, 'styles/components.css'));

    await page.setContent(buildHTML([tokensCss, componentsCss], BUTTON_FIXTURE), {
      waitUntil: 'networkidle',
    });

    // body should NOT have Hareru's font-family (no standalone.css applied).
    // Compare against the font-family from standalone styles.css to verify they differ.
    const standaloneBodyFont = await (async () => {
      const p = await page.context().newPage();
      const standaloneCss = readCSS(resolve(DIST, 'styles.css'));
      await p.setContent(buildHTML([standaloneCss], '<div>test</div>'), { waitUntil: 'networkidle' });
      const font = await p.evaluate(() => getComputedStyle(document.body).fontFamily);
      await p.close();
      return font;
    })();
    const bodyFontFamily = await page.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue('font-family'),
    );
    expect(bodyFontFamily).not.toBe(standaloneBodyFont);

    // .hui-button should still be styled
    const btnDisplay = await page.evaluate(() => {
      const btn = document.querySelector('.hui-button');
      return btn ? getComputedStyle(btn).getPropertyValue('display') : null;
    });
    expect(btnDisplay).toBe('inline-flex');
  });
});

// --- Pattern B+scope: Portable + scope.css ---
test.describe('Pattern B+scope: portable + scope.css', () => {
  test('.hui-root inherits typography, no background-color', async ({ page }) => {
    const tokensCss = readCSS(resolve(TOKENS_DIST, 'theme.css'));
    const componentsCss = readCSS(resolve(DIST, 'styles/components.css'));
    const scopeCss = readCSS(resolve(DIST, 'styles/scope.css'));

    await page.setContent(buildHTML([tokensCss, componentsCss, scopeCss], BUTTON_FIXTURE), {
      waitUntil: 'networkidle',
    });

    // .hui-root should have font-family applied
    const rootFontFamily = await page.evaluate(() => {
      const root = document.querySelector('.hui-root');
      return root ? getComputedStyle(root).getPropertyValue('font-family') : null;
    });
    expect(rootFontFamily).toBeTruthy();
    expect(rootFontFamily).not.toBe('');

    // .hui-root should NOT have background-color set (transparent/default)
    const rootBgColor = await page.evaluate(() => {
      const root = document.querySelector('.hui-root');
      return root ? getComputedStyle(root).getPropertyValue('background-color') : null;
    });
    expect(rootBgColor).toBe('rgba(0, 0, 0, 0)');

    // Button inside .hui-root should inherit typography
    const btnFontFamily = await page.evaluate(() => {
      const btn = document.querySelector('.hui-root .hui-button');
      return btn ? getComputedStyle(btn).getPropertyValue('font-family') : null;
    });
    expect(btnFontFamily).toBeTruthy();
  });
});

// --- Pattern C: Portable + layer (Tailwind v4 coexistence) ---
test.describe('Pattern C: portable + layer (Tailwind v4 coexistence)', () => {
  test('HUI styles in @layer hui work correctly with layer ordering', async ({ page }) => {
    const tokensCss = readCSS(resolve(TOKENS_DIST, 'theme.css'));
    const componentsLayerCss = readCSS(resolve(DIST, 'styles/components.layer.css'));

    // Build layered CSS simulating Tailwind v4 layer ordering.
    // Layer order + base/hui/utilities blocks in one stylesheet for correct cascade.
    const layerCss = [
      '@layer theme, base, hui, components, utilities;',
      '@layer base {',
      '  *, *::before, *::after { box-sizing: border-box; border-width: 0; border-style: solid; }',
      '  button { background-color: transparent; color: inherit; cursor: pointer; }',
      '}',
      componentsLayerCss,
      '@layer utilities {',
      '  .tw-bg-red { background-color: red; }',
      '  .tw-text-lg { font-size: 1.125rem; }',
      '}',
    ].join('\n');

    const body = `
  <button class="hui-button hui-button--default hui-button--md">HUI Button</button>
  <button class="hui-button hui-button--default hui-button--md tw-bg-red">Override Button</button>
  <button class="base-only-btn">Base Button</button>
`;

    // Use inline <style> tags in full HTML — required for @layer to work correctly
    await page.setContent(buildHTML([tokensCss, layerCss], body), {
      waitUntil: 'networkidle',
    });

    // HUI button should have styles from the hui layer
    const btnDisplay = await page.evaluate(() => {
      const btn = document.querySelector('.hui-button');
      return btn ? getComputedStyle(btn).getPropertyValue('display') : null;
    });
    expect(btnDisplay).toBe('inline-flex');

    // Utility layer (.tw-bg-red) should override HUI styles
    // (layer order: utilities > hui for normal declarations)
    const overrideBtnBg = await page.evaluate(() => {
      const btn = document.querySelector('.tw-bg-red');
      return btn ? getComputedStyle(btn).getPropertyValue('background-color') : null;
    });
    expect(overrideBtnBg).toBe('rgb(255, 0, 0)');

    // Base layer styles should NOT override HUI styles (layer order: hui > base)
    const huiBtnBg = await page.evaluate(() => {
      const btn = document.querySelector('.hui-button:not(.tw-bg-red)');
      if (!btn) return null;
      return getComputedStyle(btn).getPropertyValue('background-color');
    });
    // HUI button background should NOT be transparent (base layer's value)
    expect(huiBtnBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(huiBtnBg).not.toBe('transparent');
  });
});
