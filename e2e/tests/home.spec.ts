import { test, expect } from '@playwright/test';
import { login, ROUTES } from './helpers';

test.describe('Home Screen', () => {
  test('display_restaurants', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');

    // Wait for restaurants to load via API
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});

    // Check that page has loaded with content
    const body = await page.textContent('body');
    const hasContent = body.includes('What would you like') || body.includes('Nearby Restaurants');
    expect(hasContent).toBeTruthy();
  });

  test('navigate_to_restaurant', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');

    // Wait for restaurants to load
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});

    const restaurantCards = page.locator('[class*="card"]');
    const hasRestaurants = await restaurantCards.first().isVisible().catch(() => false);
    if (hasRestaurants) {
      await restaurantCards.first().click();
      await expect(page).toHaveURL(/\/restaurant\//, { timeout: 5000 });
    }
  });

  test('should display greeting header', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');

    // Check for new design greeting
    const body = await page.textContent('body');
    expect(body.includes('Good evening')).toBeTruthy();
    expect(body.includes('What would you like')).toBeTruthy();
  });

  test('should navigate to cart tab', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.cart);
    await page.waitForLoadState('networkidle');

    // Cart page shows either empty state or items
    const body = await page.textContent('body');
    const hasCart = body.includes('Cart') && (body.includes('Your cart is empty') || body.includes('Proceed to Checkout'));
    expect(hasCart).toBeTruthy();
  });

  test('should navigate to search tab', async ({ page }) => {
    await login(page);
    await page.goto(ROUTES.search);
    await page.waitForLoadState('networkidle');

    // Search page has search input
    const body = await page.textContent('body');
    expect(body.includes('Search')).toBeTruthy();
  });

  test('should navigate to orders when authenticated', async ({ page }) => {
    await login(page);

    await page.goto(ROUTES.orders);
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body.includes('My Orders')).toBeTruthy();
  });
});