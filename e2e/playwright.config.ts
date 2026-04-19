import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8081',
    viewport: { width: 375, height: 812 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
