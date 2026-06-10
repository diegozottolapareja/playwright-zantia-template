import { test, expect } from '../fixtures/fixtures.js';

test.describe('Compra - WinesARG', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Compra exitosa con pago en efectivo', async ({ loginPage, salesPage, paymentPage }) => {
    await loginPage.loginAsSeller();
    await salesPage.addLastThreeWines();
    await salesPage.goToPayment();
    await paymentPage.selectEfectivo();

    // Goal: se generó una orden de venta con ID
    const orderId = await paymentPage.getOrderId();
    expect(orderId).toMatch(/ORD-\d+/);
  });
});
