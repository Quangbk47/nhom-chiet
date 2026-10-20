import { expect, test } from '@playwright/test';

test('keeps one 3D scene through mixing, separation, pause and conserved drainage', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByLabel('Nồng độ AcOH ban đầu (C0)').fill('0.5');
  await page.getByRole('textbox', { name: 'Thể tích pha nước ban đầu (VR)' }).fill('0.1');
  await page.getByRole('textbox', { name: 'Tổng thể tích etyl axetat (VS,total)' }).fill('0.08');
  await page.getByLabel('Số bậc chiết (N)').fill('1');
  await page.getByRole('radio', { name: 'Chia đều theo số bậc' }).check();
  await page.getByLabel('Hệ số phân bố KD').fill('2');
  await page.getByLabel('Nguồn KD').selectOption('user_supplied');
  await page
    .getByLabel('Ghi chú hoặc mã tham chiếu KD')
    .fill('Synthetic 3D regression fixture only.');
  await page.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }).click();
  const scene = page.getByTestId('three-extraction-scene');
  await expect(scene.locator('canvas')).toBeVisible();
  await scene.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const canvas = document.querySelector('.three-extraction-scene canvas');
    canvas?.setAttribute('data-original-canvas', 'true');
  });
  await scene.screenshot({ path: testInfo.outputPath('ready.png') });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
  await page.clock.fastForward(700);
  await page.clock.fastForward(700);
  await page.clock.fastForward(40);
  await expect(scene).toHaveAttribute('data-playback-phase', 'MIXING');
  await scene.screenshot({ path: testInfo.outputPath('mixing.png') });
  await page.getByRole('button', { name: 'Tạm dừng', exact: true }).click();
  await expect(scene).toHaveAttribute('data-playback-phase', 'PAUSED');
  const pausedVolume = await scene.getAttribute('data-funnel-volume-l');
  await page.clock.fastForward(300);
  expect(await scene.getAttribute('data-funnel-volume-l')).toBe(pausedVolume);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.clock.fastForward(700);
  await page.clock.fastForward(700);
  await page.clock.fastForward(40);
  await expect(scene).toHaveAttribute('data-playback-phase', 'SEPARATING');
  await scene.screenshot({ path: testInfo.outputPath('separating.png') });
  await page.clock.fastForward(700);
  await page.clock.fastForward(700);
  await page.clock.fastForward(40);
  await expect(scene).toHaveAttribute('data-playback-phase', 'DRAINING');
  await page.clock.fastForward(280);
  const volumes = await scene.evaluate((element) => ({
    funnel: Number((element as HTMLElement).dataset.funnelVolumeL),
    beaker: Number((element as HTMLElement).dataset.receiverVolumeL),
  }));
  expect(volumes.funnel + volumes.beaker).toBeCloseTo(0.18, 9);
  expect(volumes.beaker).toBeGreaterThan(0);
  await scene.screenshot({ path: testInfo.outputPath('draining.png') });
  await page.clock.fastForward(700);
  await page.clock.fastForward(700);
  await expect(scene).toHaveAttribute('data-playback-phase', 'COMPLETED');
  await expect(scene.locator('canvas')).toHaveAttribute('data-original-canvas', 'true');
  await scene.screenshot({ path: testInfo.outputPath('completed.png') });
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
