import { expect, test } from '@playwright/test';

test.describe('Component interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Button — all variants are visible', async ({ page }) => {
    const buttonCard = page.locator('article', { hasText: 'All button variants and sizes' });
    await expect(buttonCard).toBeVisible();

    const variants = ['Default', 'Secondary', 'Destructive', 'Outline', 'Ghost', 'Link'];
    for (const variant of variants) {
      await expect(buttonCard.getByRole('button', { name: variant })).toBeVisible();
    }
  });

  test('Dialog — open and close', async ({ page }) => {
    const dialogCard = page.locator('article', { hasText: 'Modal dialog with overlay' });
    await dialogCard.locator('.hui-button', { hasText: 'Open Dialog' }).click();

    // Dialog content is visible
    const dialogContent = page.locator('.hui-dialog__content');
    await expect(dialogContent).toBeVisible();
    await expect(dialogContent.getByText('Are you sure?')).toBeVisible();

    // Close via Cancel button
    await dialogContent.locator('.hui-button', { hasText: 'Cancel' }).click();
    await expect(dialogContent).toBeHidden();
  });

  test('Sheet — open and close', async ({ page }) => {
    const sheetCard = page.locator('article', { hasText: 'Side panel overlay' });
    await sheetCard.locator('.hui-button', { hasText: 'Open Sheet' }).click();

    const sheetContent = page.locator('.hui-sheet__content');
    await expect(sheetContent).toBeVisible();
    await expect(sheetContent.getByText('Edit Profile')).toBeVisible();

    // Close via Cancel button
    await sheetContent.locator('.hui-button', { hasText: 'Cancel' }).click();
    await expect(sheetContent).toBeHidden();
  });

  test('Tabs — switching changes content', async ({ page }) => {
    const tabsCard = page.locator('article', { hasText: 'Tabbed content with Base UI' });

    // Default tab: Account
    await expect(tabsCard.getByText('Manage your account settings')).toBeVisible();

    // Click Password tab
    await tabsCard.getByRole('tab', { name: 'Password' }).click();
    await expect(tabsCard.getByText('Change your password')).toBeVisible();
    await expect(tabsCard.getByText('Manage your account settings')).toBeHidden();
  });

  test('Combobox — open and select', async ({ page }) => {
    const comboboxCard = page.locator('article', { hasText: 'Searchable select' });

    // Open combobox
    await comboboxCard.getByRole('combobox').click();
    const content = page.locator('.hui-combobox__content');
    await expect(content).toBeVisible();

    // Select React
    await content.getByRole('option', { name: 'React' }).click();
    await expect(content).toBeHidden();

    // Trigger text updated
    await expect(comboboxCard.getByRole('combobox')).toHaveText('React');
  });

  test('Command — open with button and close with Escape', async ({ page }) => {
    const commandCard = page.locator('article', { hasText: 'Command palette' });
    await commandCard.getByRole('button', { name: /Open Command Palette/ }).click();

    // Command dialog visible
    const commandDialog = page.locator('.hui-command-dialog__content');
    await expect(commandDialog).toBeVisible();
    await expect(commandDialog.getByText('Calendar')).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(commandDialog).toBeHidden();
  });
});
