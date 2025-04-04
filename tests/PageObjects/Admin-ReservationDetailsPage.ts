import {expect, Page} from "@playwright/test";

export class AdminReservationDetailsPagePO {
    constructor(private page: Page) {
    }

    public get reservationDetailsContainer() {
        return this.page.locator('h3').getByText('Anulować rezerwację?');
    }

    public async expectBandNameToBe(bandName: string) {
        await expect(this.page.getByText('Zespół: ')).toContainText(bandName);
    }

    public async expectPhoneNumToBe(phoneNum: string) {
        await expect(this.page.getByText('Nr telefonu: ')).toContainText(phoneNum);
    }

    public async expectReservationPriceToBe(amount: string) {
        await expect(this.page.getByText('Koszt rezerwacji: ')).toContainText(amount);
    }

    public async expectPaymentMethodToBe(paymentMethod: string) {
        await expect(this.page.getByText('Typ płatności: ')).toContainText(paymentMethod);
    }

    public get closeWindowButton() {
        return this.page.getByText('Zamknij okno');
    }

    public async closeReservationDetails() {
        await this.closeWindowButton.click();
    }

    public get cancelReservationButton() {
        return this.page.getByText('Anuluj rezerwację');
    }

    public async cancelReservation() {
        this.page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.accept().catch(() => {});
        });
        await this.cancelReservationButton.click();
    }
}