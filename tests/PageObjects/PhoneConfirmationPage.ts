import {expect, Page} from "@playwright/test";

export class PhoneConfirmationPagePO {
    constructor(private page: Page) {
    }

    public get verifyPhoneNumberInput() {
        return this.page.getByTestId('form-verify-number').locator('input');
    }

    public async expectEnteredNumberToBeVisible(phoneNumber: string) {
        await expect(this.verifyPhoneNumberInput).toBeVisible();
        await expect(this.verifyPhoneNumberInput).toHaveValue(phoneNumber);
    }

    public get reservationCodeInput() {
        return this.page.getByTestId('form-verify-reservation-code').locator('input');
    }

    public async enterUserReservationCode(defaultCode = 'GRbG8abEZ0Q') {
        await this.reservationCodeInput.fill(defaultCode);
    }

    public get sendButton() {
        return this.page.getByTestId('form-verify-submit');
    }

    public async confirmReservation() {
        await this.sendButton.click();
    }
}