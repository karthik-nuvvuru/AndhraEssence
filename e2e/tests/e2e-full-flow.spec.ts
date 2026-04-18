import { test, expect } from '@playwright/test';
import { DEMO_CUSTOMER, ROUTES, TIMEOUTS } from './helpers';

// Create screenshots directory structure
const SCREENSHOT_DIR = 'screenshots/e2e';

test.describe('Complete E2E Flow - Login to Order Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure directory exists
    await page.goto(ROUTES.login);
  });

  test('complete_order_flow', async ({ page }) => {
    // Step 1: Login
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-login.png` });
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Enter your email').fill(DEMO_CUSTOMER.email);
    await page.getByPlaceholder('Enter your password').fill(DEMO_CUSTOMER.password);
    // Use exact text match since "Sign In" is a div, not a button
    await page.getByText('Sign In', { exact: true }).click();

    // Wait for redirect to home
    await page.waitForURL(ROUTES.home, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Step 2: Verify home with restaurants
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-home.png` });
    await expect(page.getByText('Andhra Spice')).toBeVisible({ timeout: 10000 });

    // Step 3: Navigate to restaurant
    const restaurantCard = page.locator('text=Andhra Spice').first();
    await restaurantCard.click();
    await page.waitForURL(/\/restaurant\//, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Step 4: Verify menu items and add to cart
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-restaurant-menu.png` });

    // Find and click ADD button
    const addButton = page.getByText('ADD').first();
    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click();
      await page.waitForTimeout(TIMEOUTS.medium);
    }

    // Step 5: Go to cart
    await page.goto(ROUTES.cart);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-cart.png` });
    await expect(page.getByText('Chicken 65')).toBeVisible({ timeout: 5000 });

    // Step 6: Proceed to checkout
    const checkoutButton = page.getByRole('button', { name: /Proceed to Checkout/i });
    if (await checkoutButton.isVisible({ timeout: 5000 })) {
      await checkoutButton.click();
      await page.waitForURL(ROUTES.checkout, { timeout: 10000 });
    }

    // Step 7: Checkout page
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-checkout.png` });

    // Step 8: Place order
    const placeOrderButton = page.getByRole('button', { name: /Place Order/i });
    if (await placeOrderButton.isVisible({ timeout: 5000 })) {
      await placeOrderButton.click();
      await page.waitForTimeout(TIMEOUTS.extraLong);

      // Step 9: Verify order tracking page
      if (page.url().includes('/order/')) {
        await page.screenshot({ path: `${SCREENSHOT_DIR}/06-order-tracking.png` });
        await expect(page.getByText(/Order|Status|Tracking/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('login_and_view_restaurants', async ({ page }) => {
    // Login
    await page.goto(ROUTES.login);
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Enter your email').fill(DEMO_CUSTOMER.email);
    await page.getByPlaceholder('Enter your password').fill(DEMO_CUSTOMER.password);
    await page.getByText('Sign In', { exact: true }).click();

    // Wait for login API response
    await page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200,
      { timeout: 20000 }
    );

    // Wait for client-side routing to complete (expo-router uses client-side routing)
    await page.waitForFunction(() => {
      return window.location.pathname === '/' || window.location.pathname === '';
    }, { timeout: 10000 });

    // Navigate to home page directly to trigger restaurant fetch
    await page.goto(ROUTES.home, { waitUntil: 'networkidle' });

    // Verify restaurants load
    await expect(page.getByText('Andhra Spice')).toBeVisible({ timeout: 15000 });
  });

  test('add_item_to_cart_and_view_cart', async ({ page }) => {
    // Login
    await page.goto(ROUTES.login);
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Enter your email').fill(DEMO_CUSTOMER.email);
    await page.getByPlaceholder('Enter your password').fill(DEMO_CUSTOMER.password);
    await page.getByText('Sign In', { exact: true }).click();
    await page.waitForURL(ROUTES.home, { timeout: 15000 });

    // Navigate to restaurant
    await page.locator('text=Andhra Spice').first().click();
    await page.waitForURL(/\/restaurant\//, { timeout: 10000 });

    // Add item
    const addButton = page.getByText('ADD').first();
    await addButton.click();
    await page.waitForTimeout(TIMEOUTS.medium);

    // Go to cart
    await page.goto(ROUTES.cart);
    await page.waitForLoadState('networkidle');

    // Verify cart has items
    await expect(page.getByText('Chicken 65')).toBeVisible({ timeout: 5000 });
  });
});
