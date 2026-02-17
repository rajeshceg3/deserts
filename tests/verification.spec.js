import { test, expect } from '@playwright/test';

test('has title and enters experience', async ({ page }) => {
  test.slow();
  // Catch console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('/?headless=true');

  // Check title matches the updated one
  await expect(page).toHaveTitle(/Desert Realms/);

  // Wait for "Enter Experience" button
  const enterButton = page.getByRole('button', { name: 'Enter Experience' });
  await expect(enterButton).toBeVisible({ timeout: 30000 });

  // Click it
  await enterButton.click();

  // Check if Overlay appears by looking for "Time of Day" or "Zen Mode"
  // The overlay has an animation delay
  await expect(page.getByText('Time of Day')).toBeVisible({ timeout: 15000 });

  // Verify "Ethereal Dunes" is present.
  // Due to flex gap styling, textContent might not have spaces.
  // We check that the H1 contains "Ethereal" and "Dunes" separately or joined.
  const h1 = page.locator('h1');
  await expect(h1).toContainText('Ethereal');
  await expect(h1).toContainText('Dunes');

  // Assert no console errors
  // Filter out non-critical warnings if any (like WebGL context warnings in headless)
  const criticalErrors = consoleErrors.filter(msg => !msg.includes('suggestion') && !msg.includes('Use build.rollupOptions'));
  expect(criticalErrors).toEqual([]);
});
