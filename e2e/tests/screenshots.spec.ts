import { test, expect } from '@playwright/test';
import { DEMO_CUSTOMER, login, ROUTES, TIMEOUTS } from './helpers';

// Screenshot capture test - runs after login for authenticated screens
test.describe('Screenshot Capture - All Screens', () => {
  // Login once and reuse session
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('capture_login_screen', async ({ page }) => {
    await page.goto(ROUTES.login);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/login-screen.png', fullPage: true });
  });

  test('capture_home_screen', async ({ page }) => {
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});
    await page.screenshot({ path: 'screenshots/home-screen.png', fullPage: true });
    await expect(page.getByText('Andhra Spice')).toBeVisible({ timeout: 10000 });
  });

  test('capture_restaurant_menu', async ({ page }) => {
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});
    await page.locator('text=Andhra Spice').first().click();
    await page.waitForURL(/\/restaurant\//, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/restaurant-menu.png', fullPage: true });
  });

  test('capture_cart_empty', async ({ page }) => {
    await page.goto(ROUTES.cart);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/cart-empty.png', fullPage: true });
  });

  test('capture_cart_with_items', async ({ page }) => {
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});
    await page.locator('text=Andhra Spice').first().click();
    await page.waitForURL(/\/restaurant\//, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const addButton = page.getByText('ADD').first();
    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click();
      await page.waitForResponse(
        response => response.url().includes('/cart') && response.status() >= 200 && response.status() < 300,
        { timeout: 5000 }
      ).catch(() => {});
    }

    await page.goto(ROUTES.cart);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/cart-with-items.png', fullPage: true });
  });

  test('capture_checkout_screen', async ({ page }) => {
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});
    await page.locator('text=Andhra Spice').first().click();
    await page.waitForURL(/\/restaurant\//, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const addButton = page.getByText('ADD').first();
    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click();
      await page.waitForResponse(
        response => response.url().includes('/cart') && response.status() >= 200 && response.status() < 300,
        { timeout: 5000 }
      ).catch(() => {});
    }

    await page.goto(ROUTES.checkout);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/checkout-screen.png', fullPage: true });
  });

  test('capture_orders_screen', async ({ page }) => {
    await page.goto(ROUTES.orders);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/orders-screen.png', fullPage: true });
  });

  test('capture_profile_screen', async ({ page }) => {
    await page.goto(ROUTES.profile);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/profile-screen.png', fullPage: true });
  });

  test('capture_order_tracking', async ({ page }) => {
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');
    await page.waitForResponse(
      response => response.url().includes('/api/v1/restaurants') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});
    await page.locator('text=Andhra Spice').first().click();
    await page.waitForURL(/\/restaurant\//, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const addButton = page.getByText('ADD').first();
    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click();
      await page.waitForResponse(
        response => response.url().includes('/cart') && response.status() >= 200 && response.status() < 300,
        { timeout: 5000 }
      ).catch(() => {});
    }

    await page.goto(ROUTES.checkout);
    await page.waitForLoadState('networkidle');

    const placeOrderButton = page.getByRole('button', { name: /Place Order/i });
    if (await placeOrderButton.isVisible({ timeout: 5000 })) {
      await placeOrderButton.click();
      await page.waitForURL(/\/order\//, { timeout: 15000 }).catch(() => {});
    }

    // If we're on order tracking page
    if (page.url().includes('/order/')) {
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/order-tracking.png', fullPage: true });
    } else {
      // Navigate to orders and find an order
      await page.goto(ROUTES.orders);
      await page.waitForLoadState('networkidle');
      // Try to click on an order to navigate to tracking
      const orderCard = page.locator('[class*="order"], [class*="card"]').first();
      if (await orderCard.isVisible({ timeout: 3000 })) {
        await orderCard.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'screenshots/order-tracking.png', fullPage: true });
      }
    }
  });
});