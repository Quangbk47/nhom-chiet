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
  await expect(page.getByRole('table', { name: /Kết quả Stage 0 đến Stage 4/ })).toBeVisible();
  await expect(page.getByTestId('chart-cr-by-stage')).toBeVisible();
  await expect(page.getByTestId('chart-cumulative-recovery-by-stage')).toBeVisible();
  await expect(page.getByTestId('chart-extracted-per-stage')).toBeVisible();
  await expect(page.getByRole('table', { name: /Dữ liệu thay thế — Nồng độ/ })).toBeVisible();
  await expect(page.getByTestId('playback-status')).toContainText('Sẵn sàng · Bậc 0/4');

  const start = page.getByRole('button', { name: 'Bắt đầu' });
  await start.focus();
  await expect(start).toBeFocused();
  await start.press('Enter');
  await expect(page.getByRole('button', { name: 'Tạm dừng' })).toBeVisible();
  await page.getByRole('button', { name: 'Tạm dừng' }).click();
  await expect(page.getByTestId('playback-status')).toContainText('Đã tạm dừng');
  await page.getByRole('button', { name: '2×' }).click();
  await expect(page.getByRole('button', { name: '2×' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Bậc tiếp theo' }).click();
  await expect(page.getByTestId('playback-status')).toContainText('Hoàn tất bậc · Bậc 1/4');

  const stageTableRegion = page.getByRole('region', {
    name: 'Bảng kết quả theo bậc, có thể cuộn ngang',
  });
  await stageTableRegion.focus();
  await expect(stageTableRegion).toBeFocused();
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

test('marks playback stale and disables controls when an input changes', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nồng độ AcOH ban đầu (C0)').fill('0.5');
  await page.getByRole('textbox', { name: 'Thể tích pha nước ban đầu (VR)' }).fill('0.1');
  await page.getByRole('textbox', { name: 'Tổng thể tích etyl axetat (VS,total)' }).fill('0.08');
  await page.getByLabel('Số bậc chiết (N)').fill('1');
  await page.getByRole('radio', { name: 'Chia đều theo số bậc' }).check();
  await page.getByLabel('Hệ số phân bố KD').fill('2');
  await page.getByLabel('Nguồn KD').selectOption('user_supplied');
  await page.getByLabel('Ghi chú hoặc mã tham chiếu KD').fill('E2E fixture');
  await page.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }).click();
  await expect(page.getByTestId('playback-status')).toContainText('Sẵn sàng');

  await page.getByLabel('Nồng độ AcOH ban đầu (C0)').fill('0.4');
  await expect(page.getByTestId('form-status')).toContainText('Stale result');
  await expect(page.getByTestId('funnel-svg')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Bảng Stage 0…N' })).toHaveCount(0);
  await expect(page.getByTestId('chart-cr-by-stage')).toHaveCount(0);
});

test('creates, compares and removes immutable scenario snapshots', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nồng độ AcOH ban đầu (C0)').fill('0.5');
  await page.getByRole('textbox', { name: 'Thể tích pha nước ban đầu (VR)' }).fill('0.1');
  await page.getByRole('textbox', { name: 'Tổng thể tích etyl axetat (VS,total)' }).fill('0.08');
  await page.getByLabel('Số bậc chiết (N)').fill('1');
  await page.getByRole('radio', { name: 'Chia đều theo số bậc' }).check();
  await page.getByLabel('Hệ số phân bố KD').fill('2');
  await page.getByLabel('Nguồn KD').selectOption('user_supplied');
  await page.getByLabel('Ghi chú hoặc mã tham chiếu KD').fill('E2E scenario fixture');
  await page.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }).click();

  const scenarioPanel = page.locator('.scenario-panel');
  await scenarioPanel.getByLabel('Tên scenario').fill('Scenario A');
  await scenarioPanel.getByRole('button', { name: 'Lưu scenario hiện tại' }).click();
  await expect(scenarioPanel.locator('tbody input').first()).toHaveValue('Scenario A');

  await page.getByLabel('Nồng độ AcOH ban đầu (C0)').fill('0.4');
  await expect(scenarioPanel.getByRole('status')).toContainText('stale, invalid hoặc error');
  await expect(scenarioPanel.getByRole('button', { name: 'Lưu scenario hiện tại' })).toBeDisabled();
  await page.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }).click();

  await scenarioPanel.getByLabel('Tên scenario').first().fill('Scenario B');
  await scenarioPanel.getByRole('button', { name: 'Lưu scenario hiện tại' }).click();
  await expect(scenarioPanel.getByRole('alert')).toContainText('Điều kiện so sánh khác');
  await scenarioPanel.locator('tbody tr').first().getByRole('button', { name: 'Xóa' }).click();
  await expect(scenarioPanel.locator('tbody input').first()).toHaveValue('Scenario B');
  await expect(
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).resolves.toBe(true);
});
