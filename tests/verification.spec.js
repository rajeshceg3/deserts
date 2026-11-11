import { test, expect } from '@playwright/test';

test('has title and boots with accessible controls', async ({ page }) => {
  // reduced-motion users get motion off by default
  test.slow();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page).toHaveTitle(/Desert Realms/);

  // Controls boot in their canonical states: motion off, sound off (opt-in).
  await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'false');

  // Keyboard reset: rotate then Home restores the camera.
  const canvas = page.locator('canvas[data-camera]');
  const before = await canvas.getAttribute('data-camera');
  await canvas.focus();
  await page.keyboard.press('ArrowLeft');
  expect(await canvas.getAttribute('data-camera')).not.toBe(before);
  await page.keyboard.press('Home');
  expect(await canvas.getAttribute('data-camera')).toBe(before);

  const criticalErrors = consoleErrors.filter(msg => !msg.includes('suggestion') && !msg.includes('Use build.rollupOptions'));
  expect(criticalErrors).toEqual([]);
});
