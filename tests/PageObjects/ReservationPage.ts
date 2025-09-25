import {expect, Page} from "@playwright/test";
import {Calendar} from "../components/calendar";
import {ReservationForm, reservationTypeNameType, roomNameType} from "../components/reservation-form";

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

    public async fillTheFormAndCheckCheckbox(room: roomNameType, type: reservationTypeNameType, bandName: string, phoneNum: string, startHour: number, endHour: number, startDay: Date, endDay?: Date) {
        await this.reservationForm.enterDataToTheReservationForm(room, type, bandName, phoneNum, startHour, endHour, startDay);
        await this.selectAgreementCheckbox();
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

    public async expectNewUserOnlinePaymentAlertToBe() {
        const message = 'Dla nowych użytkowników dostępna jest wyłącznie płatność online. Po pierwszej odbytej próbie pojawi się opcja płatności gotówką.';

        await expect(this.formInputFieldSelector.last()).toContainText(message);
    }
}