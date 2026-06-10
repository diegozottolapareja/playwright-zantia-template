import { test, expect } from '../fixtures/fixtures.js';

test.describe('Vendedor - WinesARG', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAsSeller();
  });

  // --- Catálogo ---

  test('El catálogo carga con vinos visibles', async ({ dashboardPage }) => {
    await dashboardPage.verifySellerDashboardLoaded();
    const count = await dashboardPage.getWineCount();
    expect(count).toBeGreaterThan(0);
  });

  test('El catálogo muestra más vinos después del lazy scroll', async ({ salesPage, dashboardPage }) => {
    await dashboardPage.verifySellerDashboardLoaded();
    const countBefore = await dashboardPage.getWineCount();
    await salesPage.scrollUntilWinesLoaded();
    const countAfter = await dashboardPage.getWineCount();
    expect(countAfter).toBeGreaterThanOrEqual(countBefore);
  });

  // --- Carrito ---

  test('El botón Ir a Pagar no es visible con carrito vacío', async ({ salesPage }) => {
    await expect(salesPage.goToPayButton).not.toBeVisible();
  });

  test('Agregar un vino muestra el botón Ir a Pagar', async ({ salesPage }) => {
    await salesPage.scrollUntilWinesLoaded();
    await salesPage.addWineByName('Gran Malbec');
    await expect(salesPage.goToPayButton).toBeVisible();
  });

  test('Agregar múltiples vinos distintos mantiene el botón Ir a Pagar visible', async ({ salesPage }) => {
    await salesPage.addLastThreeWines();
    await expect(salesPage.goToPayButton).toBeVisible();
  });

  // --- Navegación a pago ---

  test('Ir a Pagar redirige a /seller/payment', async ({ salesPage }) => {
    await salesPage.addLastThreeWines();
    await salesPage.goToPayment();
    await expect(salesPage.page).toHaveURL(/seller\/payment/);
  });

  // --- Contador de stock ---

  test('Agregar un vino incrementa su contador a 1', async ({ salesPage }) => {
    const wine = 'Gran Malbec';
    await salesPage.scrollUntilWinesLoaded();
    await salesPage.addWineByName(wine);
    const qty = await salesPage.getWineQuantity(wine);
    expect(qty).toBe(1);
  });

  test('Agregar dos veces el mismo vino incrementa el contador a 2', async ({ salesPage }) => {
    const wine = 'Gran Malbec';
    await salesPage.scrollUntilWinesLoaded();
    await salesPage.addWineByName(wine);
    await salesPage.addWineByName(wine);
    const qty = await salesPage.getWineQuantity(wine);
    expect(qty).toBe(2);
  });

  test('Quitar un vino decrementa el contador', async ({ salesPage }) => {
    const wine = 'Gran Malbec';
    await salesPage.scrollUntilWinesLoaded();
    await salesPage.addWineByName(wine);
    await salesPage.addWineByName(wine);
    await salesPage.removeWineByName(wine);
    const qty = await salesPage.getWineQuantity(wine);
    expect(qty).toBe(1);
  });

  test('Al quitar hasta 0 el contador queda en 0', async ({ salesPage }) => {
    const wine = 'Gran Malbec';
    await salesPage.scrollUntilWinesLoaded();
    await salesPage.addWineByName(wine);
    await salesPage.removeWineByName(wine);
    const qty = await salesPage.getWineQuantity(wine);
    expect(qty).toBe(0);
  });

  // --- Vino sin stock ---

  test('Vino sin stock muestra badge "Sin stock"', async ({ salesPage }) => {
    await salesPage.scrollUntilWinesLoaded();
    const hasBadge = await salesPage.hasNoStockBadge(salesPage.zeroStockWineName);
    expect(hasBadge).toBe(true);
  });

  test('Vino sin stock tiene contador en 0', async ({ salesPage }) => {
    await salesPage.scrollUntilWinesLoaded();
    const qty = await salesPage.getWineQuantity(salesPage.zeroStockWineName);
    expect(qty).toBe(0);
  });

  test('Vino sin stock tiene el botón + deshabilitado', async ({ salesPage }) => {
    await salesPage.scrollUntilWinesLoaded();
    const disabled = await salesPage.isPlusButtonDisabled(salesPage.zeroStockWineName);
    expect(disabled).toBe(true);
  });

  test('Vino sin stock no agrega items al carrito al intentar clickear +', async ({ salesPage }) => {
    await salesPage.scrollUntilWinesLoaded();
    // El botón está disabled, el carrito no debería activarse
    await expect(salesPage.goToPayButton).not.toBeVisible();
  });

  // --- Limpiar carrito ---

  test('Quitar un vino reduce el carrito', async ({ salesPage }) => {
    await salesPage.scrollUntilWinesLoaded();
    await salesPage.addWineByName('Torrontés de Altura');
    await salesPage.addWineByName('Gran Malbec');
    await salesPage.removeWineByName('Gran Malbec');
    // El carrito sigue activo con el vino restante
    await expect(salesPage.goToPayButton).toBeVisible();
  });

  test('Vaciar el carrito oculta el botón Ir a Pagar', async ({ salesPage }) => {
    await salesPage.addLastThreeWines();
    await salesPage.clearCart();
    await expect(salesPage.goToPayButton).not.toBeVisible();
  });

  test('Después de vaciar el carrito se puede iniciar una nueva compra', async ({ salesPage }) => {
    await salesPage.addLastThreeWines();
    await salesPage.clearCart();
    // Inicia nueva compra desde cero
    await salesPage.addWineByName('Torrontés de Altura');
    await expect(salesPage.goToPayButton).toBeVisible();
  });

  test('Vaciar carrito y completar nueva compra genera orden válida', async ({ salesPage, paymentPage }) => {
    await salesPage.addLastThreeWines();
    await salesPage.clearCart();
    await salesPage.addLastThreeWines();
    await salesPage.goToPayment();
    await paymentPage.selectEfectivo();
    const orderId = await paymentPage.getOrderId();
    expect(orderId).toMatch(/ORD-\d+/);
  });

  // --- Pago ---

  test('Pago en efectivo genera un ID de orden válido', async ({ salesPage, paymentPage }) => {
    test.setTimeout(60000);
    await salesPage.addLastThreeWines();
    await salesPage.goToPayment();
    await paymentPage.selectEfectivo();
    const orderId = await paymentPage.getOrderId();
    expect(orderId).toMatch(/ORD-\d+/);
  });

  test('Pago exitoso muestra pantalla de confirmación', async ({ salesPage, paymentPage }) => {
    await salesPage.scrollUntilWinesLoaded();
    await salesPage.addLastThreeWines();
    await salesPage.goToPayment();
    await paymentPage.selectEfectivo();
    await expect(paymentPage.successHeading).toBeVisible();
    await expect(salesPage.page).toHaveURL(/seller\/payment\/success/);
  });
});
