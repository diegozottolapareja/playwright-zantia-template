// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? undefined : 1,
  reporter: process.env.CI ? 'blob' : [
    ['monocart-reporter', {
      name: 'WinesARG - Test Report',
      outputFile: 'monocart-report/index.html',
      summary: true,
    }],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'https://winesarg.vercel.app',
    headless: !process.env.CI ? false : true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'iPhone 14',
      use: { ...devices['iPhone 14'] },
    },
  ],
});
