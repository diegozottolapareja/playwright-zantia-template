import { expect } from '@playwright/test';

export class DashboardPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    /** @type {import('@playwright/test').Page} */
    this.page = page;

    // Seller dashboard (/seller/sales)
    this.wineItems = page.locator('h3');

    // Admin dashboard (/admin/dashboard)
    this.analyticsCard = page.locator('text=Análisis de Ventas');
    this.sellerTrackingCard = page.locator('text=Seguimiento de Vendedores');
    this.aiAssistantCard = page.locator('text=Asistente IA');
  }

  // --- Seller ---

  async verifySellerDashboardLoaded() {
    await this.wineItems.first().waitFor({ state: 'visible', timeout: 10000 });

    // Checkpoint: el catálogo cargó con al menos un vino visible
    await expect.soft(this.wineItems.first()).toBeVisible();
  }

  async getWineCount() {
    return await this.wineItems.count();
  }

  // --- Admin ---

  async verifyAdminDashboardLoaded() {
    await this.analyticsCard.waitFor({ state: 'visible', timeout: 10000 });

    // Checkpoint: el dashboard admin cargó con las cards de navegación
    await expect.soft(this.analyticsCard).toBeVisible();
  }

  async navigateToAnalytics() {
    await this.analyticsCard.click();
    await this.page.waitForURL('**/admin/analytics', { timeout: 10000 });
  }
}
