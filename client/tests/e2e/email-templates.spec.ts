import { expect, test } from '@playwright/test';

test('gallery template opens in builder and exports non-empty code', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /templates/i }).click();
  await expect(page.getByRole('heading', { name: 'Email Templates' })).toBeVisible();
  await page.screenshot({ path: 'test-results/email-template-manager.png', fullPage: true });

  await page.getByRole('button', { name: /browse templates|create template/i }).first().click();
  await expect(page.getByRole('heading', { name: 'Choose a starting point' })).toBeVisible();
  await expect(page.locator('.email-template-card')).toHaveCount(28);
  await page.screenshot({ path: 'test-results/email-template-gallery.png', fullPage: true });

  const card = page.locator('.email-template-card').filter({ hasText: 'SaaS Welcome' }).first();
  await card.hover();
  await card.getByRole('button', { name: /use template/i }).click();

  await expect(page.locator('.email-builder-toolbar')).toBeVisible();
  await expect.poll(async () => page.locator('.builder-canvas-shell iframe').count()).toBeGreaterThan(0);
  await page.getByRole('button', { name: /heading/i }).click();
  await page.screenshot({ path: 'test-results/email-template-builder.png', fullPage: true });

  await page.getByRole('button', { name: /export/i }).click();
  const exportCode = page.locator('.export-code');
  await expect(exportCode).toBeVisible();
  await expect.poll(async () => (await exportCode.inputValue()).length).toBeGreaterThan(500);
  await expect.poll(async () => /SaaS Welcome|Welcome to/i.test(await exportCode.inputValue())).toBeTruthy();
});
