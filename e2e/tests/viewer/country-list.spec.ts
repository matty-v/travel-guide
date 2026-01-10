import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Country List', () => {
  test('displays list of countries', async ({ mockApi }) => {
    await mockApi.goto('/');

    // Should display both mock countries
    await expect(mockApi.getByRole('button', { name: /Italy/i })).toBeVisible();
    await expect(mockApi.getByRole('button', { name: /Japan/i })).toBeVisible();
  });

  test('displays country descriptions', async ({ mockApi }) => {
    await mockApi.goto('/');

    await expect(mockApi.getByText('Explore the beauty of Italy')).toBeVisible();
    await expect(mockApi.getByText('Discover the wonders of Japan')).toBeVisible();
  });

  test('navigates to country page when clicked', async ({ mockApi }) => {
    await mockApi.goto('/');

    // Click on Italy
    await mockApi.getByRole('button', { name: /Italy/i }).click();

    // Should navigate to country page (HashRouter uses /#/)
    await expect(mockApi).toHaveURL(/.*#\/country\/italy/);
  });

  test('shows loading spinner while fetching', async ({ page }) => {
    // Set up a delayed response
    await page.route('**/countries', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/');

    // Loading spinner should be visible initially
    await expect(page.locator('[class*="animate-spin"]')).toBeVisible();
  });

  test('shows empty state when no countries exist', async ({ page }) => {
    await page.route('**/countries', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/');

    await expect(page.getByText('No Countries Yet')).toBeVisible();
    await expect(page.getByText('Check back soon for travel guides!')).toBeVisible();
  });

  test('shows error state and retry button on API failure', async ({ page }) => {
    await page.route('**/countries', async (route) => {
      await route.fulfill({
        status: 500,
        body: 'Server error',
      });
    });

    await page.goto('/');

    await expect(page.getByRole('button', { name: /Try Again/i })).toBeVisible();
  });
});
