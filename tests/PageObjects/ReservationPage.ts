import {expect, Page} from "@playwright/test";
import {Calendar} from "../components/calendar";
import {ReservationForm} from "../components/reservation-form";

export class ReservationPagePO {
    constructor(private page: Page) {
    }

    calendar = new Calendar(this.page);
    reservationForm = new ReservationForm(this.page);

    formInputFieldSelector = this.page.locator('.form__input-field');

    public get agreementCheckbox() {
        return this.formInputFieldSelector.locator('[type="checkbox"]');
    }

    public async selectAgreementCheckbox() {
        await this.agreementCheckbox.click();
    }

    public get submitWithOnlinePaymentButton() {
        return this.page.getByTestId('form-submit-online-payment');
    }

    public async submitWithOnlinePayment() {
        await this.submitWithOnlinePaymentButton.click();
    }

    public async getOnlineReservationPrice() {

        const getPrice = async () => {
            const text = await this.submitWithOnlinePaymentButton.textContent();
            return text.substring(33, 35);
        }

        await expect(async () => {
            const currentPrice = await getPrice();
            await expect(currentPrice.length).toBeGreaterThan(0);
        }).toPass();

        return getPrice();
    }

    public async getCashReservationPrice() {

        const getPrice = async () => {
            const text = await this.submitWithCashPaymentButton.textContent();
            return text.substring(38, 40);
        };

        await expect(async () => {
            const currentPrice = await getPrice();
            await expect(currentPrice.length).toBeGreaterThan(0);
        }).toPass();

        return getPrice();
    }

    public get submitWithCashPaymentButton() {
        return this.page.getByTestId('form-submit');
    }

    public async submitWithCashPayment() {
        await this.submitWithCashPaymentButton.click();
    }

    public async expectNewUserOnlinePaymentAlertToBe() {
        const message = 'Dla nowych użytkowników dostępna jest wyłącznie płatność online. Po pierwszej odbytej próbie pojawi się opcja płatności gotówką.';

        await expect(this.formInputFieldSelector.last()).toContainText(message);
    }

    public get successfulReservationAlert() {
        return this.page.getByTestId('successful-reservation');
    }

    public async expectReservationToBeCreated(inputDate: string, startHour: number, bandName: string, successfulAlert = true, adminPanel = false) {

        if (successfulAlert) {
            // only appears when paying with cash
            await this.reservationForm.closeSuccessfulReservationAlert();
        }
        await this.calendar.expectReservationToBeVisible(inputDate, startHour, bandName, adminPanel);
    }
}