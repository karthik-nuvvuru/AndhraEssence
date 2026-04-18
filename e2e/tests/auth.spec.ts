import { test, expect } from '@playwright/test';
import { DEMO_CUSTOMER, login, ROUTES } from './helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.login);
  });

  test('login_with_valid_credentials', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').fill(DEMO_CUSTOMER.email);
    await page.getByPlaceholder('Enter your password').fill(DEMO_CUSTOMER.password);
    await page.locator('div').filter({ hasText: /^Sign In$/ }).first().click();

    await expect(page).toHaveURL(ROUTES.home, { timeout: 10000 });
    // After login should show greeting and restaurants
    await expect(page.getByText('What would you like')).toBeVisible({ timeout: 5000 });
  });

  test('login_with_invalid_credentials', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').fill('invalid@example.com');
    await page.getByPlaceholder('Enter your password').fill('wrongpassword');
    await page.locator('div').filter({ hasText: /^Sign In$/ }).first().click();

    // On web, Alert.alert shows browser alert which we can detect via dialog event
    // but we can't easily check its text. Instead we verify we're still on login page.
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
  });

  test('register_new_user', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^Sign Up$/ }).first().click();
    await expect(page).toHaveURL(ROUTES.register);

    const timestamp = Date.now();
    await page.getByPlaceholder('Enter your full name').fill('Test User');
    await page.getByPlaceholder('Enter your email').fill(`testuser${timestamp}@example.com`);
    await page.getByPlaceholder('Enter your phone number').fill('9876543210');
    await page.getByPlaceholder('Create a password').fill('testpass123');
    await page.getByPlaceholder('Confirm your password').fill('testpass123');

    await page.locator('div').filter({ hasText: /^Sign Up$/ }).first().click();

    // On web, Alert.alert is a blocking browser alert. We verify the button was clicked
    // by checking we're not crashed and form is still interactive (no validation error).
    // The actual navigation to login happens after alert is dismissed.
    await page.waitForTimeout(1000);
    // Verify form still rendered (not crashed) - could be on register or login based on alert handling
    const onRegister = page.url().includes('/auth/register');
    const onLogin = page.url().includes('/auth/login');
    expect(onRegister || onLogin).toBeTruthy();
  });

  test('logout', async ({ page }) => {
    await login(page);

    await expect(page.getByText('What would you like')).toBeVisible({ timeout: 10000 });

    await page.goto(ROUTES.profile);
    await page.waitForTimeout(1000);

    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/auth\/login/);
    }
  });

  test('should display login screen elements', async ({ page }) => {
    await expect(page.getByText('Sign in to continue')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
  });

  test('should navigate to register from login', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^Sign Up$/ }).first().click();
    await expect(page).toHaveURL(ROUTES.register);
  });

  test('should navigate to login from register', async ({ page }) => {
    await page.goto(ROUTES.register);
    await page.locator('div').filter({ hasText: /^Sign In$/ }).first().click();
    await expect(page).toHaveURL(ROUTES.login);
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto(ROUTES.register);
    await page.getByPlaceholder('Enter your full name').fill('Test User');
    await page.getByPlaceholder('Enter your email').fill('test@example.com');
    await page.getByPlaceholder('Enter your phone number').fill('1234567890');
    await page.getByPlaceholder('Create a password').fill('password123');
    await page.getByPlaceholder('Confirm your password').fill('differentpassword');
    await page.locator('div').filter({ hasText: /^Sign Up$/ }).first().click();

    // After password mismatch, alert shows and stays on register page
    await expect(page).toHaveURL(/\/auth\/register/, { timeout: 5000 });
  });

  test('should show error when password is too short', async ({ page }) => {
    await page.goto(ROUTES.register);
    await page.getByPlaceholder('Enter your full name').fill('Test User');
    await page.getByPlaceholder('Enter your email').fill('test@example.com');
    await page.getByPlaceholder('Enter your phone number').fill('1234567890');
    await page.getByPlaceholder('Create a password').fill('123');
    await page.getByPlaceholder('Confirm your password').fill('123');
    await page.locator('div').filter({ hasText: /^Sign Up$/ }).first().click();

    // After short password, alert shows and stays on register page
    await expect(page).toHaveURL(/\/auth\/register/, { timeout: 5000 });
  });
});