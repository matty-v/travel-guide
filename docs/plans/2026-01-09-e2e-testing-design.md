# E2E Testing Design

## Overview

Add end-to-end testing to the Travel Guide app using Playwright with mocked API responses.

## Decisions

- **Framework**: Playwright - modern, fast, excellent TypeScript support
- **Scope**: Critical paths (public viewer + admin login)
- **API Strategy**: Mock responses via route interception
- **Architecture**: Fixture-based composition (no page objects)

## Project Structure

```
e2e/
├── fixtures/
│   ├── mock-data.ts      # Country and content mock data
│   └── test-fixtures.ts  # Custom Playwright fixtures (api mocking, auth)
├── tests/
│   ├── viewer/
│   │   ├── country-list.spec.ts   # Homepage country browsing
│   │   └── country-page.spec.ts   # Country detail + content viewing
│   └── admin/
│       └── login.spec.ts          # Admin authentication flow
└── playwright.config.ts  # Playwright configuration
```

## Configuration

- Base URL: `http://localhost:5173` (Vite dev server)
- Auto-start dev server via `webServer` config
- Chromium only initially
- Screenshot on failure

## Mock Data

```typescript
// e2e/fixtures/mock-data.ts
export const mockCountries = [
  {
    slug: 'italy',
    name: 'Italy',
    flag: '🇮🇹',
    menu: [{ id: '1', title: 'Overview', path: 'overview.md' }],
    palette: { primary: '#1e40af', secondary: '#3b82f6', ... }
  },
  // 2-3 test countries
];

export const mockContent = {
  'italy/overview.md': '# Welcome to Italy\n\nTravel guide content...'
};
```

## Custom Fixtures

```typescript
// e2e/fixtures/test-fixtures.ts
// - mockApi fixture: Intercepts API calls, returns mock data
// - authenticatedPage fixture: Sets localStorage auth token
```

## Test Cases

### Public Viewer

**country-list.spec.ts:**
- Displays list of countries with names and flags
- Clicking a country navigates to `/country/:slug`
- Shows loading state while fetching
- Handles empty state gracefully

**country-page.spec.ts:**
- Displays country name and sidebar menu
- Clicking menu item loads content
- Renders markdown content correctly
- Handles PDF content (shows PDF viewer)
- Back navigation returns to country list

### Admin

**login.spec.ts:**
- Shows login form at `/admin/login`
- Successful login redirects to `/admin` dashboard
- Invalid password shows error message
- Logout clears auth and redirects

## NPM Scripts

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

## Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```
