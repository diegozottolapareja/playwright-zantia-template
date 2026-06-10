import { test, expect } from '../fixtures/fixtures.js';

test.describe('Login - WinesARG', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Login exitoso como Vendedor', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAsSeller();
    await dashboardPage.verifySellerDashboardLoaded();

    // Goal: el catálogo de vinos tiene productos disponibles
    expect(await dashboardPage.getWineCount()).toBeGreaterThan(0);
  });

  test('Login exitoso como Administrador', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAsAdmin();
    await dashboardPage.verifyAdminDashboardLoaded();

    // Goal: el dashboard admin muestra la card de Seguimiento de Vendedores
    await expect(dashboardPage.sellerTrackingCard).toBeVisible();
  });
});
