import { expect, test } from '@playwright/test';

test.describe('z-index hierarchy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Dialog overlay has z-index 1000', async ({ page }) => {
    // Open Dialog
    const dialogCard = page.locator('article', { hasText: 'Modal dialog with overlay' });
    await dialogCard.locator('.hui-button', { hasText: 'Open Dialog' }).click();

    const overlay = page.locator('.hui-dialog__overlay');
    await expect(overlay).toBeVisible();

    const zIndex = await overlay.evaluate((el) => getComputedStyle(el).zIndex);
    expect(zIndex).toBe('1000');
  });

  test('Sheet overlay has z-index 1000', async ({ page }) => {
    // Open Sheet
    const sheetCard = page.locator('article', { hasText: 'Side panel overlay' });
    await sheetCard.locator('.hui-button', { hasText: 'Open Sheet' }).click();

    const overlay = page.locator('.hui-sheet__overlay');
    await expect(overlay).toBeVisible();

    const zIndex = await overlay.evaluate((el) => getComputedStyle(el).zIndex);
    expect(zIndex).toBe('1000');
  });

  test('Combobox dropdown renders below modal z-index', async ({ page }) => {
    // Open Combobox
    const comboboxCard = page.locator('article', { hasText: 'Searchable select' });
    await comboboxCard.getByRole('combobox').click();

    const content = page.locator('.hui-combobox__content');
    await expect(content).toBeVisible();

    // Verify via CSS variable that dropdown z-index token (50) < modal (1000)
    const dropdownZ = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--hui-z-index-dropdown').trim(),
    );
    const modalZ = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--hui-z-index-modal').trim(),
    );
    expect(Number.parseInt(dropdownZ, 10)).toBeLessThan(Number.parseInt(modalZ, 10));
  });

  test('modal z-index (1000) > dropdown z-index (50)', async ({ page }) => {
    const modalZ = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--hui-z-index-modal').trim(),
    );
    const dropdownZ = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--hui-z-index-dropdown').trim(),
    );

    expect(Number.parseInt(modalZ, 10)).toBeGreaterThan(Number.parseInt(dropdownZ, 10));
  });
});
