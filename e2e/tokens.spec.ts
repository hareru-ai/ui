import { expect, test } from '@playwright/test';

function getCSSVar(varName: string) {
  return `getComputedStyle(document.documentElement).getPropertyValue('${varName}').trim()`;
}

test.describe('Design Tokens — CSS variables', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('color tokens use OKLCH format', async ({ page }) => {
    const colorVars = [
      '--hui-color-primary',
      '--hui-color-secondary',
      '--hui-color-destructive',
      '--hui-color-background',
      '--hui-color-foreground',
    ];

    for (const varName of colorVars) {
      const value = await page.evaluate(getCSSVar(varName));
      expect(value, `${varName} should be OKLCH`).toMatch(/oklch\(/);
    }
  });

  test('easing tokens are defined with correct values', async ({ page }) => {
    const expected: Record<string, string> = {
      '--hui-easing-linear': 'cubic-bezier(0, 0, 1, 1)',
      '--hui-easing-in': 'cubic-bezier(0.42, 0, 1, 1)',
      '--hui-easing-out': 'cubic-bezier(0, 0, 0.58, 1)',
      '--hui-easing-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
    };

    for (const [varName, expectedValue] of Object.entries(expected)) {
      const value = await page.evaluate(getCSSVar(varName));
      expect(value, `${varName}`).toBe(expectedValue);
    }
  });

  test('z-index tokens are defined with correct values', async ({ page }) => {
    const expected: Record<string, string> = {
      '--hui-z-index-base': '10',
      '--hui-z-index-dropdown': '50',
      '--hui-z-index-sticky': '500',
      '--hui-z-index-modal': '1000',
      '--hui-z-index-toast': '1100',
    };

    for (const [varName, expectedValue] of Object.entries(expected)) {
      const value = await page.evaluate(getCSSVar(varName));
      expect(value, `${varName}`).toBe(expectedValue);
    }
  });

  test('font-size 5xl and 6xl tokens exist', async ({ page }) => {
    const expected: Record<string, string> = {
      '--hui-font-size-5xl': '2.5rem',
      '--hui-font-size-6xl': '3rem',
    };

    for (const [varName, expectedValue] of Object.entries(expected)) {
      const value = await page.evaluate(getCSSVar(varName));
      expect(value, `${varName}`).toBe(expectedValue);
    }
  });

  test('chart colors 1-5 are defined', async ({ page }) => {
    for (let i = 1; i <= 5; i++) {
      const varName = `--hui-color-chart-${i}`;
      const value = await page.evaluate(getCSSVar(varName));
      expect(value, `${varName} should be defined`).not.toBe('');
      expect(value, `${varName} should be OKLCH`).toMatch(/oklch\(/);
    }
  });
});
