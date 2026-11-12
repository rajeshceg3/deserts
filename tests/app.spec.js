import { test, expect } from '@playwright/test';

test('Application loads and enters experience', async ({ page }) => {
  test.slow();

  await page.goto('/');

  // The app boots straight into the 360 experience (no loader gate).
  const canvas = page.locator('canvas[data-camera]');
  await expect(canvas).toBeVisible({ timeout: 30000 });

  // Ten realms are selectable.
  const realm = page.locator('[data-realm]');
  await expect(realm.first()).toBeVisible();
  expect(await realm.count()).toBe(10);

  // Heading and per-realm story render.
  await expect(page.locator('h1')).toHaveText('Desert Realms');
  await expect(page.locator('.realm-story h2')).toHaveText('Ethereal Dunes');

  // Selecting another realm updates the story.
  await page.locator('[data-realm="1"]').click();
  await expect(page.locator('.realm-story h2')).toHaveText('Glacial Serenity');
});
