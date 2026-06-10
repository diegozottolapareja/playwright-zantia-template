import { expect } from '@playwright/test';

export class SalesPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    /** @type {import('@playwright/test').Page} */
    this.page = page;

    this.goToPayButton = page.locator('button', { hasText: 'Ir a Pagar' });

    // Los últimos 3 vinos del catálogo
    this.targetWines = ['Torrontés de Altura', 'Gran Malbec', 'Reserva Cabernet'];

    // Vino con stock = 0 en la app
    this.zeroStockWineName = 'Malbec Roble';
  }

  // El catálogo carga lazy — scrollea hasta que todos los vinos target estén en el DOM
  async scrollUntilWinesLoaded() {
    for (let i = 0; i < 10; i++) {
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(600);
      const loaded = await Promise.all(
        this.targetWines.map(name => this.page.locator('h3', { hasText: name }).count())
      );
      if (loaded.every(count => count > 0)) break;
    }
  }

  /** @param {string} wineName */
  async addWineByName(wineName) {
    await this.page.locator('h3', { hasText: wineName }).waitFor({ state: 'visible', timeout: 10000 });
    // Busca el h3 con el nombre, sube al card y clickea su botón + — todo en el DOM en un paso
    await this.page.evaluate((name) => {
      const h3s = [...document.querySelectorAll('h3')];
      const h3 = h3s.find(el => el.textContent?.includes(name));
      if (!h3) throw new Error(`Vino no encontrado: ${name}`);
      // Sube niveles hasta encontrar el card (div con rounded-3xl)
      let card = h3.parentElement;
      while (card && !card.className.includes('rounded-3xl')) {
        card = card.parentElement;
      }
      if (!card) throw new Error(`Card no encontrado para: ${name}`);
      const plusBtn = card.querySelector('button svg.lucide-plus')?.closest('button');
      if (!plusBtn) throw new Error(`Botón + no encontrado para: ${name}`);
      plusBtn.click();
    }, wineName);
    await this.page.waitForTimeout(300);
  }

  async addLastThreeWines() {
    await this.scrollUntilWinesLoaded(); // siempre scroll antes de agregar los 3
    for (const wine of this.targetWines) {
      await this.addWineByName(wine);
    }

    // Checkpoint: el botón Ir a Pagar aparece cuando hay items en el carrito
    await expect.soft(this.goToPayButton).toBeVisible();
  }

  async goToPayment() {
    await this.goToPayButton.click();
    await this.page.waitForURL('**/seller/payment', { timeout: 10000 });

    // Checkpoint: navegamos correctamente a la pantalla de pago
    await expect.soft(this.page).toHaveURL(/seller\/payment/);
  }

  /** @param {string} wineName */
  async removeWineByName(wineName) {
    await this.page.locator('h3', { hasText: wineName }).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.evaluate((name) => {
      const h3s = [...document.querySelectorAll('h3')];
      const h3 = h3s.find(el => el.textContent?.includes(name));
      if (!h3) throw new Error(`Vino no encontrado: ${name}`);
      let card = h3.parentElement;
      while (card && !card.className.includes('rounded-3xl')) {
        card = card.parentElement;
      }
      if (!card) throw new Error(`Card no encontrado para: ${name}`);
      const minusBtn = card.querySelector('button svg.lucide-minus')?.closest('button');
      if (!minusBtn) throw new Error(`Botón - no encontrado para: ${name}`);
      minusBtn.click();
    }, wineName);
    await this.page.waitForTimeout(300);
  }

  /** @param {string} wineName @returns {Promise<number>} */
  async getWineQuantity(wineName) {
    return await this.page.evaluate((name) => {
      const h3s = [...document.querySelectorAll('h3')];
      const h3 = h3s.find(el => el.textContent?.includes(name));
      if (!h3) throw new Error(`Vino no encontrado: ${name}`);
      let card = h3.parentElement;
      while (card && !card.className.includes('rounded-3xl')) card = card.parentElement;
      const qty = card?.querySelector('span.text-xl')?.textContent?.trim();
      return Number(qty ?? -1);
    }, wineName);
  }

  /** @param {string} wineName @returns {Promise<boolean>} */
  async isPlusButtonDisabled(wineName) {
    return await this.page.evaluate((name) => {
      const h3s = [...document.querySelectorAll('h3')];
      const h3 = h3s.find(el => el.textContent?.includes(name));
      if (!h3) return false;
      let card = h3.parentElement;
      while (card && !card.className.includes('rounded-3xl')) card = card.parentElement;
      const btn = card?.querySelector('button svg.lucide-plus')?.closest('button');
      return btn?.disabled ?? false;
    }, wineName);
  }

  /** @param {string} wineName @returns {Promise<boolean>} */
  async hasNoStockBadge(wineName) {
    return await this.page.evaluate((name) => {
      const h3s = [...document.querySelectorAll('h3')];
      const h3 = h3s.find(el => el.textContent?.includes(name));
      if (!h3) return false;
      let card = h3.parentElement;
      while (card && !card.className.includes('rounded-3xl')) card = card.parentElement;
      return card?.textContent?.includes('Sin stock') ?? false;
    }, wineName);
  }

  async clearCart() {
    for (const wine of this.targetWines) {
      // Quita hasta que el botón - desaparezca (cubre cantidad > 1)
      for (let i = 0; i < 5; i++) {
        const hasMinusBtn = await this.page.evaluate((name) => {
          const h3s = [...document.querySelectorAll('h3')];
          const h3 = h3s.find(el => el.textContent?.includes(name));
          if (!h3) return false;
          let card = h3.parentElement;
          while (card && !card.className.includes('rounded-3xl')) card = card.parentElement;
          return !!card?.querySelector('button svg.lucide-minus');
        }, wine);
        if (!hasMinusBtn) break;
        await this.removeWineByName(wine);
      }
    }

    // Checkpoint: el carrito quedó vacío
    await expect.soft(this.goToPayButton).not.toBeVisible();
  }
}
