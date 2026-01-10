import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Admin Login', () => {
  test('displays login form', async ({ mockApi }) => {
    await mockApi.goto('/#/admin/login');

    await expect(mockApi.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
    await expect(mockApi.getByLabel(/password/i)).toBeVisible();
    await expect(mockApi.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('successful login redirects to admin dashboard', async ({ mockApi }) => {
    await mockApi.goto('/#/admin/login');

    // Fill in password and submit
    await mockApi.getByLabel(/password/i).fill('admin123');
    await mockApi.getByRole('button', { name: /login/i }).click();

    // Should redirect to admin dashboard
    await expect(mockApi).toHaveURL(/.*#\/admin$/);
    await expect(mockApi.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('shows error message on invalid password', async ({ mockApi }) => {
    await mockApi.goto('/#/admin/login');

    // Fill in wrong password and submit
    await mockApi.getByLabel(/password/i).fill('wrongpassword');
    await mockApi.getByRole('button', { name: /login/i }).click();

    // Should show error message
    await expect(mockApi.getByText('Invalid password')).toBeVisible();

    // Should stay on login page
    await expect(mockApi).toHaveURL(/.*#\/admin\/login/);
  });

  test('shows loading state while authenticating', async ({ page }) => {
    // Set up delayed response
    await page.route('**/admin/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock countries endpoint as well
    await page.route('**/countries', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/#/admin/login');

    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /login/i }).click();

    // Should show loading text
    await expect(page.getByRole('button', { name: /logging in/i })).toBeVisible();
  });

  test('admin dashboard shows login prompt when not authenticated', async ({ page }) => {
    // Mock countries endpoint
    await page.route('**/countries', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/#/admin');

    // Should show login prompt
    await expect(page.getByText(/need to be logged in/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /go to login/i })).toBeVisible();
  });

  test('admin dashboard displays after successful authentication', async ({ mockApi }) => {
    await mockApi.goto('/#/admin/login');

    // Login
    await mockApi.getByLabel(/password/i).fill('admin123');
    await mockApi.getByRole('button', { name: /login/i }).click();

    // Should see dashboard options
    await expect(mockApi.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    await expect(mockApi.getByRole('link', { name: /manage countries/i })).toBeVisible();
    await expect(mockApi.getByRole('link', { name: /edit content/i })).toBeVisible();
    await expect(mockApi.getByRole('link', { name: /menu structure/i })).toBeVisible();
    await expect(mockApi.getByRole('link', { name: /color palettes/i })).toBeVisible();
  });
});
