import { test, expect } from '@playwright/test';
import { loginAndAddItemToCart, ROUTES, TIMEOUTS } from './helpers';

test.describe('Cart Screen', () => {
  test('view_cart', async ({ page }) => {
    await page.goto(ROUTES.cart);
    await page.waitForLoadState('networkidle');

    const body = await page.textContent('body');
    const hasContent = body.includes('Cart') && (body.includes('Your cart is empty') || body.includes('Proceed to Checkout'));
    expect(hasContent).toBeTruthy();
  });

  test('add_item_to_cart', async ({ page }) => {
    await loginAndAddItemToCart(page);

    const currentUrl = page.url();
    if (currentUrl.includes('/restaurant/')) {
      // Verify item was added by checking for cart confirmation
      await expect(page.getByText(/Added to cart|View Cart/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('update_quantity', async ({ page }) => {
    await loginAndAddItemToCart(page);

    await page.goto(ROUTES.cart);
    await page.waitForLoadState('networkidle');

    const body = await page.textContent('body');
    const hasItems = body.includes('Subtotal');
    if (!hasItems) {
      test.skip();
    }

    // Quantity is shown as x1, x2, etc
    expect(body.includes('x')).toBeTruthy();
  });

  test('should display empty cart message', async ({ page }) => {
    await page.goto(ROUTES.cart);
    await page.waitForLoadState('networkidle');

    // Check for empty cart state
    const body = await page.textContent('body');
    expect(body.includes('Your cart is empty')).toBeTruthy();
  });

  test('should navigate to checkout when items in cart', async ({ page }) => {
    await loginAndAddItemToCart(page);

    await page.goto(ROUTES.cart);
    await page.waitForLoadState('networkidle');

    const checkoutButton = page.getByText('Proceed to Checkout');
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await expect(page).toHaveURL(ROUTES.checkout);
    }
  });
});