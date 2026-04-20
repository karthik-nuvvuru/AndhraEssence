# E2E Tests - AndhraEssence

Playwright end-to-end tests for the AndhraEssence food delivery platform.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests (headless)
npm test

# Run with UI
npm run test:ui
```

## Commands

```bash
# Run all tests (headless)
npm test

# Run with Playwright UI
npm run test:ui

# Run with visible browser
npm run test:headed

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run specific test
npx playwright test tests/auth.spec.ts:login

# Run with tag
npx playwright test --grep @smoke

# Open Playwright Inspector
npx playwright test --ui

# Update screenshots (after UI changes)
npx playwright test --update-snapshots

# Show report after test run
npx playwright show-report
```

## Configuration

Tests are configured in `playwright.config.ts`:

```typescript
export default {
  testDir: './tests',
  outputDir: './test-results',
  screenshotsDir: './screenshots',
  videoDir: './videos',
  timeout: 30000,
  retries: 2,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8081',
    headless: true,
    viewport: { width: 390, height: 844 }, // iPhone 14
  },
};
```

## Project Structure

```
e2e/
├── tests/               # Test files
│   ├── auth.spec.ts    # Authentication tests
│   ├── home.spec.ts    # Home screen tests
│   ├── restaurant.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   └── orders.spec.ts
├── pages/              # Page Object Models
├── playwright.config.ts
├── package.json
└── README.md
```

## Test Coverage

| Feature | Test File | Status |
|---------|-----------|--------|
| Authentication | `auth.spec.ts` | Passing |
| Landing Page | `home.spec.ts` | Passing |
| Restaurant Discovery | `restaurant.spec.ts` | Passing |
| Cart Management | `cart.spec.ts` | Passing |
| Checkout Flow | `checkout.spec.ts` | Passing |
| Order History | `orders.spec.ts` | Passing |

## Running Tests

### Prerequisites
1. Backend must be running on port 8000
2. Mobile app must be running on port 8081

```bash
# Start backend
cd backend && DEMO_MODE=true poetry run uvicorn app.main:app --reload --port 8000 &

# Start mobile
cd mobile && npm start &

# Run tests
npm test
```

### CI Mode

```bash
# Run in CI (no video, no screenshots)
npm test -- --ci
```

## Page Objects

Tests use Page Object pattern for maintainability:

```typescript
// Example: Login page
export class LoginPage {
  constructor(page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');
  }
}
```

## Debugging

```bash
# Run with headed browser
npm run test:headed

# Pause on failure
npx playwright test --pause-on-failure

# Open trace viewer
npx playwright show-trace trace.zip
```

## Screenshots

Screenshots are captured on test failure and stored in `screenshots/`:
- `screenshots/auth/` - Authentication tests
- `screenshots/home/` - Home screen tests
- `screenshots/cart/` - Cart tests
- etc.

## Continuous Integration

The tests are configured to run in CI environments:

```bash
# GitHub Actions example
- name: E2E Tests
  run: npm test
  env:
    CI: true
```

## Tech Stack

- **Framework**: Playwright
- **Language**: TypeScript
- **Test Runner**: @playwright/test
- **Assertions**: expect (Playwright built-in)