import { Page } from '@playwright/test';

export const DEMO_CUSTOMER = {
  email: 'customer@example.com',
  password: 'customer123',
};

export const RESTAURANT_OWNER = {
  email: 'restaurant@example.com',
  password: 'owner123',
};

export const TIMEOUTS = {
  short: 1000,
  medium: 2000,
  long: 5000,
  extraLong: 10000,
};

export const ROUTES = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  cart: '/(tabs)/cart',
  search: '/(tabs)/search',
  orders: '/(tabs)/orders',
  profile: '/(tabs)/profile',
  checkout: '/checkout',
  restaurant: (id: string) => `/restaurant/${id}`,
  order: (id: string) => `/order/${id}`,
};

export async function login(page: Page, customer = DEMO_CUSTOMER): Promise<void> {
  await page.goto(ROUTES.login);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Enter your email').fill(customer.email);
  await page.getByPlaceholder('Enter your password').fill(customer.password);
  // TouchableOpacity renders as div on web, use text selector with exact match
  await page.locator('div').filter({ hasText: /^Sign In$/ }).first().click();

  // Wait for login API response before proceeding
  try {
    await page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200,
      { timeout: 10000 }
    );
  } catch {
    // If no auth response found, wait for URL change as fallback
    await page.waitForURL((url) => !url.includes('/auth/login'), { timeout: 10000 }).catch(() => {});
  }

  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
}

export async function loginAndAddItemToCart(page: Page): Promise<void> {
  await login(page);

  await page.goto(ROUTES.home);
  await page.waitForLoadState('networkidle');

  const restaurantCard = page.locator('[class*="card"]').first();
  if (await restaurantCard.isVisible()) {
    await restaurantCard.click();
    // Wait for restaurant page to load and render menu
    await page.waitForURL(/\/restaurant\//, { timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
  }

  if (page.url().includes('/restaurant/')) {
    const addButton = page.getByText('ADD').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      // Wait for cart API response if available
      await page.waitForResponse(
        response => response.url().includes('/cart') && response.status() >= 200 && response.status() < 300,
        { timeout: 5000 }
      ).catch(() => {});
    }
  }
}
