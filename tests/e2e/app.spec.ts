import { expect, test } from '@playwright/test';

test('shows the foundation notice', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Nền tảng ứng dụng đang được xây dựng' }),
  ).toBeVisible();
});
