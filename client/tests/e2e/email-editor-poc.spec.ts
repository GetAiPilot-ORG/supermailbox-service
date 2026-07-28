import { expect, test } from '@playwright/test';

test('react email editor POC loads and exports', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/dev/email-editor/react-email');
  await expect(page.getByRole('heading', { name: 'Unlayer React Email Editor' })).toBeVisible();
  await expect(page.getByText('Editor ready with sample loaded')).toBeVisible({ timeout: 45_000 });
  await page.getByRole('button', { name: 'Edit sample' }).click();
  await page.getByRole('button', { name: 'Save JSON' }).click();
  await page.getByRole('button', { name: 'Export HTML' }).click();
  await expect(page.getByText(/HTML exported:/)).toBeVisible({ timeout: 20_000 });
  await page.screenshot({ path: testInfo.outputPath('react-email-editor-poc.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('easy email editor POC exposes React 19 incompatibility', async ({ page }, testInfo) => {
  await page.goto('/dev/email-editor/easy-email');
  await expect(page.getByRole('heading', { name: 'Easy Email MJML Editor' })).toBeVisible();
  await expect(page.getByText('Easy Email failed in this React 19 app')).toBeVisible();
  await expect(page.getByText(/findDOMNode/)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('easy-email-editor-poc.png'), fullPage: true });
});
