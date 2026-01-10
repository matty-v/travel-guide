import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Country Page', () => {
  test.beforeEach(async ({ mockApi }) => {
    // Navigate to country page
    await mockApi.goto('/#/country/italy');
    // Expand sidebar by clicking the toggle button
    await mockApi.locator('aside button').first().click();
  });

  test('displays country name in sidebar', async ({ mockApi }) => {
    // Country name should appear in sidebar header when expanded (use first() to avoid strict mode)
    await expect(mockApi.locator('aside').getByText('Italy').first()).toBeVisible();
  });

  test('displays sidebar menu items', async ({ mockApi }) => {
    // Menu items from mock data should be visible in sidebar
    await expect(mockApi.locator('aside').getByText('Overview')).toBeVisible();
    await expect(mockApi.locator('aside').getByText('Rome')).toBeVisible();
    await expect(mockApi.locator('aside').getByText('Travel Guide PDF')).toBeVisible();
  });

  test('loads and displays markdown content when menu item clicked', async ({ mockApi }) => {
    // Click on Overview menu item in sidebar
    await mockApi.locator('aside').getByText('Overview').click();

    // Content should be displayed
    await expect(mockApi.getByRole('heading', { name: 'Welcome to Italy' })).toBeVisible();
    await expect(mockApi.getByText(/rich history, art, and cuisine/i)).toBeVisible();
  });

  test('loads different content when switching menu items', async ({ mockApi }) => {
    // Click Overview first
    await mockApi.locator('aside').getByText('Overview').click();
    await expect(mockApi.getByRole('heading', { name: 'Welcome to Italy' })).toBeVisible();

    // Click Rome
    await mockApi.locator('aside').getByText('Rome').click();
    await expect(mockApi.getByRole('heading', { name: 'Rome' })).toBeVisible();
    await expect(mockApi.getByText(/Eternal City/i)).toBeVisible();
  });

  test('shows PDF viewer for PDF content type', async ({ mockApi }) => {
    // Click on PDF menu item in sidebar
    await mockApi.locator('aside').getByText('Travel Guide PDF').click();

    // Should show the PDF title
    await expect(mockApi.getByRole('heading', { name: 'Travel Guide PDF' })).toBeVisible();
  });

  test('navigates back to country list via home button', async ({ mockApi }) => {
    // Click home button in sidebar
    await mockApi.locator('aside').getByText('Home').click();

    // Should be back at homepage
    await expect(mockApi).toHaveURL(/.*#\/$/);
    // Country cards should be visible
    await expect(mockApi.getByRole('button', { name: /Italy/i })).toBeVisible();
  });

  test('shows welcome message when no menu item selected', async ({ mockApi }) => {
    // Should show welcome text in main content area (already visible on initial load)
    await expect(mockApi.getByRole('heading', { name: 'Welcome to Italy' })).toBeVisible();
    await expect(mockApi.getByText(/Select a location from the menu/i)).toBeVisible();
  });
});

test.describe('Country Page - Error States', () => {
  test('shows error state when country not found', async ({ page }) => {
    // Set up mock that returns 404
    await page.route('**/countries', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/countries/unknown', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Country not found' }),
      });
    });

    await page.goto('/#/country/unknown');

    // The app shows "Failed to fetch country" when the API returns 404
    await expect(page.getByText('Failed to fetch country')).toBeVisible();
  });
});
