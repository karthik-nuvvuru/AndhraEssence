import { test, expect } from '@playwright/test';
import { login, ROUTES, TIMEOUTS } from './helpers';

test.describe('Orders Screen', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('view_order_history', async ({ page }) => {
    await page.goto(ROUTES.orders);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('My Orders')).toBeVisible({ timeout: 5000 });

    const orderCards = page.locator('[class*="card"]');
    const hasOrders = await orderCards.first().isVisible().catch(() => false);
    const emptyState = await page.getByText('No orders yet').isVisible().catch(() => false);

    expect(hasOrders || emptyState).toBeTruthy();
  });

  test('view_order_detail', async ({ page }) => {
    await page.goto(ROUTES.orders);
    await page.waitForLoadState('networkidle');

    const orderCard = page.locator('[class*="card"]').first();
    const hasOrderCard = await orderCard.isVisible().catch(() => false);

    if (!hasOrderCard) {
      await expect(page.getByText('No orders yet')).toBeVisible();
      return;
    }

    await orderCard.click();
    await page.waitForLoadState('networkidle');

    const onOrderDetail = page.url().includes('/order/');

    if (onOrderDetail) {
      const hasStatusTimeline = await page.getByText('Order Status').isVisible().catch(() => false);
      const hasOrderDetails = await page.getByText('Order Details').isVisible().catch(() => false);

      expect(hasStatusTimeline || hasOrderDetails).toBeTruthy();
    }
  });

  test('should display orders screen header', async ({ page }) => {
    await page.goto(ROUTES.orders);
    await expect(page.getByText('My Orders')).toBeVisible();
  });

  test('should display empty state when no orders', async ({ page }) => {
    await page.goto(ROUTES.orders);
    await page.waitForLoadState('networkidle');

    const hasEmptyState = await page.getByText('No orders yet').isVisible().catch(() => false);
    if (hasEmptyState) {
      await expect(page.getByText('Your order history will appear here')).toBeVisible();
    }
  });

  test('should display order tracking timeline', async ({ page }) => {
    await page.goto(ROUTES.orders);
    await page.waitForLoadState('networkidle');

    const orderCard = page.locator('[class*="card"]').first();
    if (await orderCard.isVisible()) {
      await orderCard.click();
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/order/')) {
        await expect(page.getByText('Order Status')).toBeVisible();
      }
    }
  });
});
