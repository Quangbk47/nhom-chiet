import { expect, test } from '@playwright/test';

test('shows the Phase 6 application shell and input form', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Mô phỏng chiết lỏng–lỏng' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dữ liệu mô phỏng' })).toBeVisible();
  await expect(page.getByLabel('Nồng độ AcOH ban đầu (C0)')).toBeVisible();
  await expect(page.getByTestId('form-status')).toContainText('Initial');
});
