import { expect } from '@playwright/test';

export class PaymentPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    /** @type {import('@playwright/test').Page} */
    this.page = page;

    this.efectivoButton = page.locator('button', { hasText: 'Efectivo' });
    this.orderIdText = page.locator('text=/ORD-/');
    this.successHeading = page.locator('text=¡Compra Completada!');
  }

  async selectEfectivo() {
    await this.efectivoButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.efectivoButton.click();

    // Espera la respuesta del backend y la navegación a success
    await this.page.waitForURL('**/seller/payment/success', { timeout: 20000 });

    // Checkpoint: llegamos a la pantalla de éxito
    await expect.soft(this.successHeading).toBeVisible();
  }

  async getOrderId() {
    const text = await this.orderIdText.innerText();
    return text.trim();
  }
}
