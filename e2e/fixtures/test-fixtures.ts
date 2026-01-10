import { test as base, type Page } from '@playwright/test';
import { mockCountries, mockContent } from './mock-data';

type TestFixtures = {
  mockApi: Page;
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  mockApi: async ({ page }, use) => {
    // Mock GET /countries
    await page.route('**/countries', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCountries),
        });
      } else {
        await route.continue();
      }
    });

    // Mock GET /countries/:slug
    await page.route('**/countries/*', async (route) => {
      const url = route.request().url();
      const slug = url.split('/countries/')[1]?.split('/')[0]?.split('?')[0];
      const country = mockCountries.find((c) => c.slug === slug);

      if (route.request().method() === 'GET' && country) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(country),
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Country not found' }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock GET /content/:countrySlug/:contentPath
    await page.route('**/content/**', async (route) => {
      const url = route.request().url();
      const match = url.match(/\/content\/([^/]+)\/(.+?)(?:\?|$)/);

      if (match && route.request().method() === 'GET') {
        const [, countrySlug, contentPath] = match;
        const key = `${countrySlug}/${contentPath}`;
        const content = mockContent[key];

        if (content) {
          await route.fulfill({
            status: 200,
            contentType: 'text/markdown',
            headers: {
              etag: content.etag,
              'last-modified': content.lastModified,
            },
            body: content.markdown,
          });
        } else {
          await route.fulfill({
            status: 404,
            body: 'Content not found',
          });
        }
      } else {
        await route.continue();
      }
    });

    // Mock POST /admin/login
    await page.route('**/admin/login', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        // Accept 'admin123' as the test password
        if (body?.password === 'admin123') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, token: 'mock-token' }),
          });
        } else {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Invalid password' }),
          });
        }
      } else {
        await route.continue();
      }
    });

    await use(page);
  },

  authenticatedPage: async ({ page }, use) => {
    // Set up authentication before using the page
    await page.addInitScript(() => {
      localStorage.setItem('adminToken', 'mock-token');
    });

    // Apply all the API mocks
    await page.route('**/countries', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            await import('./mock-data').then((m) => m.mockCountries)
          ),
        });
      } else {
        await route.continue();
      }
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
