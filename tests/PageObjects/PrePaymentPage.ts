import {Page} from "@playwright/test";

export class PrePaymentPagePO {
    constructor(private page: Page) {
    }

    public get emailVerificationContainer() {
        return this.page.locator('.verification-container').first();
    }

    public get emailAddressInput() {
        return this.page.getByTestId('form-payment-email');
    }

    public async enterEmailAddress(email: string) {
        await this.emailAddressInput.fill(email);
    }

    public get paymentButton() {
        return this.page.getByTestId('go-to-payment');
    }

    public async goToPayment() {
        await this.paymentButton.click();
    }
}