import {expect, Page} from "@playwright/test";

export class PaymentMethodMenu {
    constructor(private page: Page) {
    }

    public async expectTransactionAmountToBe(amount: string) {
        await expect(this.page.locator('div.transaction-info__money-amount')).toContainText(`${amount},00`);
    }

    public get paymentContainer() {
        return this.page.locator('div.main-layout__container');
    }

    public get transferButton() {
        return this.page.locator('#payment-wall-tab-2');
    }

    public async goToTransferPayment() {
        await this.transferButton.click();
    }
}