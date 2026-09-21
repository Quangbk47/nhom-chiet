import { expect, test } from '@playwright/test';

test('shows the Phase 6 application shell and input form', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Mô phỏng chiết lỏng–lỏng' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dữ liệu mô phỏng' })).toBeVisible();
  await expect(page.getByLabel('Nồng độ AcOH ban đầu (C0)')).toBeVisible();
  await expect(page.getByTestId('form-status')).toContainText('Initial');
});

test('renders a responsive stage visualization from valid input', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nồng độ AcOH ban đầu (C0)').fill('0.5');
  await page.getByRole('textbox', { name: 'Thể tích pha nước ban đầu (VR)' }).fill('0.1');
  await page.getByRole('textbox', { name: 'Tổng thể tích etyl axetat (VS,total)' }).fill('0.08');
  await page.getByLabel('Số bậc chiết (N)').fill('4');
  await page.getByRole('radio', { name: 'Chia đều theo số bậc' }).check();
  await page.getByLabel('Hệ số phân bố KD').fill('2');
  await page.getByLabel('Nguồn KD').selectOption('user_supplied');
  await page
    .getByLabel('Ghi chú hoặc mã tham chiếu KD')
    .fill('Playwright software fixture only; not a project default.');
  await page.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }).click();

  await expect(page.getByTestId('form-status')).toContainText('Valid');
  await expect(page.getByTestId('funnel-svg')).toBeVisible();
  await expect(page.getByRole('table', { name: /Thông tin thay thế/ })).toBeVisible();
  const box = await page.getByTestId('funnel-svg').boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.width).toBeLessThanOrEqual(viewport!.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
