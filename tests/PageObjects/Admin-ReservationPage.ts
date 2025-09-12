import {Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {Calendar} from "../components/calendar";

    type reservationScopeType = 'Aktywne' | 'Oczekujące potwierdzenia' | 'Wygasłe' | 'Anulowane';

export class AdminReservationPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);
    calendar = new Calendar(this.page);

    public get calendarElement() {
        return this.page.locator('.reservation__calendar');
    }

    public getReservationScopeElement(scopeName: reservationScopeType) {
        return this.page.getByLabel(scopeName);
    }

    public async selectReservationScope(scopeName: reservationScopeType) {
        await this.getReservationScopeElement(scopeName).click();
    }

    public get filterByPhoneNumInput() {
        return this.page.getByText('Filtruj nr tel.').locator('input[type="tel"]');
    }

    public async filterReservationByPhoneNum(number: string) {
        await this.filterByPhoneNumInput.fill(number)
    }

    public async selectPaymentType(paymentType: 'wszystkie' | 'online' | 'cash') {
        const paymentTypeLabelSelector = this.page.getByLabel('Typ płatności');

        if (paymentType === 'wszystkie') {
            await paymentTypeLabelSelector.selectOption('');
        } else {
            await paymentTypeLabelSelector.selectOption(paymentType);
        }
    }

    public get firstReservationAdnotation() {
        return this.page.getByText('★ → Pierwsza nieanulowana rezerwacja z tego numeru');
    }
}