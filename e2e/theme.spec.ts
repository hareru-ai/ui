import { expect, test } from '@playwright/test';

function getCSSVar(varName: string) {
  return `getComputedStyle(document.documentElement).getPropertyValue('${varName}').trim()`;
}

test.describe('Theme switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Light button sets data-theme="light"', async ({ page }) => {
    await page.getByRole('button', { name: 'Light' }).click();
    const theme = await page.locator('html').getAttribute('data-theme');
    expect(theme).toBe('light');
  });

  test('Dark button sets data-theme="dark"', async ({ page }) => {
    await page.getByRole('button', { name: 'Dark' }).click();
    const theme = await page.locator('html').getAttribute('data-theme');
    expect(theme).toBe('dark');
  });

  test('color tokens change between light and dark', async ({ page }) => {
    const colorVars = [
      '--hui-color-background',
      '--hui-color-foreground',
      '--hui-color-primary',
    ];

    // Set light theme
    await page.getByRole('button', { name: 'Light' }).click();
    const lightValues: Record<string, string> = {};
    for (const varName of colorVars) {
      lightValues[varName] = await page.evaluate(getCSSVar(varName));
    }

    // Switch to dark theme
    await page.getByRole('button', { name: 'Dark' }).click();
    for (const varName of colorVars) {
      const darkValue = await page.evaluate(getCSSVar(varName));
      expect(darkValue, `${varName} should differ between themes`).not.toBe(lightValues[varName]);
    }
  });

  test('shared tokens do not change between themes', async ({ page }) => {
    const sharedVars = [
      '--hui-easing-out',
      '--hui-easing-in',
      '--hui-z-index-modal',
      '--hui-z-index-dropdown',
      '--hui-spacing-4',
      '--hui-radius-md',
      '--hui-font-size-base',
    ];

    // Set light theme
    await page.getByRole('button', { name: 'Light' }).click();
    const lightValues: Record<string, string> = {};
    for (const varName of sharedVars) {
      lightValues[varName] = await page.evaluate(getCSSVar(varName));
    }

    // Switch to dark theme
    await page.getByRole('button', { name: 'Dark' }).click();
    for (const varName of sharedVars) {
      const darkValue = await page.evaluate(getCSSVar(varName));
      expect(darkValue, `${varName} should be the same in both themes`).toBe(
        lightValues[varName],
      );
    }
  });
});
