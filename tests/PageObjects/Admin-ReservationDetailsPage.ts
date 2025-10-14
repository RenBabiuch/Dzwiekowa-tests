import {expect, Page} from "@playwright/test";

export class AdminReservationDetailsPagePO {
    constructor(private page: Page) {
    }

    public get reservationDetailsContainer() {
        return this.page.locator('h2').getByText('Anulować rezerwację?');
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
        return this.page.getByLabel('close');
    }

    public async closeReservationDetails() {
        await this.closeWindowButton.click();
    }

    public get cancelReservationWithRefundButton() {
        return this.page.getByRole('button', {name: 'Anuluj ze zwrotem zapłaty'});
    }

    public async cancelReservationWithRefund() {
        this.page.once('dialog', dialog => {
            dialog.accept().catch(() => {});
        });
        await this.cancelReservationWithRefundButton.click();
    }

    public get cancelReservationWithoutRefundButton() {
        return this.page.getByRole('button', {name: 'Anuluj bez zwrotu zapłaty'});
    }

    public async cancelReservationWithoutRefund() {
        this.page.once('dialog', dialog => {
            dialog.accept().catch(() => {});
        });
        await this.cancelReservationWithoutRefundButton.click();
    }

    public get blockNumberButton() {
        return this.page.getByText('Zablokuj numer...');
    }

    public async blockPhoneNumber() {
        await this.blockNumberButton.click();
    }
}