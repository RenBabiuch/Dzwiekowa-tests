import {Page} from "@playwright/test";

export class PrePaymentPagePO {
    constructor(private page: Page) {
    }

    public get emailVerificationContainer() {
        return this.page.locator('.reservation__form');
    }

    public get emailAddressInput() {
        return this.page.locator('[name="email"] input');
    }

    public async enterEmailAddress(defaultEmail = 'allkaraoke@allkaraoke.party') {
        await this.emailAddressInput.fill(defaultEmail);
    }

    public get paymentButton() {
        return this.page.getByTestId('go-to-payment');
    }

    public async goToPaymentMethod() {
        await this.paymentButton.click();
    }
}