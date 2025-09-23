import {Page} from "@playwright/test";

type reservationScopeType = 'Aktywne' | 'Oczekujące potwierdzenia' | 'Wygasłe' | 'Anulowane';

export class AdminFilters {
    constructor(private page: Page) {
    }

    public getReservationScopeElement(scopeName: reservationScopeType) {
        return this.page.getByLabel(scopeName);
    }

    public async filterByReservationScope(scopeName: reservationScopeType) {
        await this.getReservationScopeElement(scopeName).click();
    }

    public get filterByPhoneNumInput() {
        return this.page.getByText('Filtruj nr tel.').locator('input[type="tel"]');
    }

    public async filterReservationByPhoneNum(number: string) {
        await this.filterByPhoneNumInput.fill(number);
    }

    public async filterByPaymentType(paymentType: 'wszystkie' | 'online' | 'cash') {
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

    public async filterByReservationType(type: 'Wszystkie' | 'Solo' | 'Zespół' | 'Solo z talerzami' | 'Nagrywka' | 'Lekcja/Duet' | 'Próba 5+więcej') {
        const reservationTypeLabelSelector = this.page.locator('.reservation__calendar').getByLabel('Typ rezerwacji');
        await reservationTypeLabelSelector.selectOption({label: type});
    }
}