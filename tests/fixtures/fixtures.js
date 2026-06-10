import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { SalesPage } from '../pages/SalesPage.js';
import { PaymentPage } from '../pages/PaymentPage.js';

/**
 * @typedef {{ loginPage: LoginPage, dashboardPage: DashboardPage, salesPage: SalesPage, paymentPage: PaymentPage }} MyFixtures
 */

export const test = /** @type {import('@playwright/test').TestType<MyFixtures & import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions, import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions>} */ (
  base.extend({
    loginPage: async ({ page }, use) => {
      await use(new LoginPage(page));
    },
    dashboardPage: async ({ page }, use) => {
      await use(new DashboardPage(page));
    },
    salesPage: async ({ page }, use) => {
      await use(new SalesPage(page));
    },
    paymentPage: async ({ page }, use) => {
      await use(new PaymentPage(page));
    },
  })
);

export { expect } from '@playwright/test';
