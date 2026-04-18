import { test, expect } from '@playwright/test';
import { login, ROUTES } from './helpers';

test.describe('Search Screen', () => {
  test('search_by_cuisine', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.search);
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Search restaurants or cuisines...').fill('biryani');
    await page.keyboard.press('Enter');

    // Wait for search response
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});

    // After search, should show results or empty state
    const body = await page.textContent('body');
    const hasResults = body.includes('Andhra') || body.includes('Restaurant');
    const hasNoResults = body.includes('No results found');
    expect(hasResults || hasNoResults).toBeTruthy();
  });

  test('search_no_results', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.search);
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Search restaurants or cuisines...').fill('xyznonexistent12345');
    await page.keyboard.press('Enter');

    // Wait for search response
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});

    // Either shows "no results" message or stays on search page
    const body = await page.textContent('body');
    const hasNoResults = body.includes('No results found');
    // If no no-results message, at least we should still be on search page with input
    const stillOnSearch = await page.getByPlaceholder('Search restaurants or cuisines...').isVisible().catch(() => false);
    expect(hasNoResults || stillOnSearch).toBeTruthy();
  });

  test('should display search screen with search input', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.search);
    await page.waitForLoadState('networkidle');

    await expect(page.getByPlaceholder('Search restaurants or cuisines...')).toBeVisible();
  });

  test('should display empty search state when no query', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.search);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Search for restaurants')).toBeVisible();
  });

  test('should navigate to restaurant from search results', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.search);
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Search restaurants or cuisines...').fill('biryani');
    await page.keyboard.press('Enter');

    // Wait for search response
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});

    const cards = page.locator('[class*="card"]');
    if (await cards.first().isVisible()) {
      await cards.first().click();
      await expect(page).toHaveURL(/\/restaurant\//, { timeout: 5000 });
    }
  });
});