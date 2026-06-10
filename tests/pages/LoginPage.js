import { expect } from '@playwright/test';

export class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    /** @type {import('@playwright/test').Page} */
    this.page = page;

    this.sellerButton = page.locator('button', { hasText: 'Ingresar como Vendedor' });
    this.adminButton = page.locator('button', { hasText: 'Ingresar como Administrador' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForLoginPage() {
    await this.sellerButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async loginAsSeller() {
    await this.waitForLoginPage();
    await this.sellerButton.click();
    await this.page.waitForURL('**/seller/**', { timeout: 10000 });

    // Checkpoint: verificamos que la navegación al dashboard del Vendedor fue exitosa
    await expect.soft(this.page).toHaveURL(/seller/);
  }

  async loginAsAdmin() {
    await this.waitForLoginPage();
    await this.adminButton.click();
    await this.page.waitForURL('**/admin/**', { timeout: 10000 });

    // Checkpoint: verificamos que la navegación al dashboard del Admin fue exitosa
    await expect.soft(this.page).toHaveURL(/admin/);
  }
}
