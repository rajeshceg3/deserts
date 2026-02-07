import { test, expect } from '@playwright/test';

test('Application loads and enters experience', async ({ page }) => {
  test.slow(); // Mark test as slow (triples timeout)

  // Navigate to root
  await page.goto('/');

  // Wait for the loader to finish (button appears)
  const enterButton = page.getByRole('button', { name: 'Enter Experience' });
  await expect(enterButton).toBeVisible({ timeout: 60000 });

  // Wait a bit for animations to settle
  await page.waitForTimeout(1000);

  // Click enter
  await enterButton.click({ force: true });

  // Wait for overlay to appear
  const zenButton = page.getByLabel('Enable Zen Mode');
  await expect(zenButton).toBeVisible({ timeout: 20000 });

  // Verify heading
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
});
