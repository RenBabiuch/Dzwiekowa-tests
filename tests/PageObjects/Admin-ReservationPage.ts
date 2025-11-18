import {Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {Calendar} from "../components/calendar";
import {AdminFilters} from "../components/admin-filters";
import {ReservationForm} from "../components/reservation-form";
import {Checkboxes, checkboxStateType} from "../components/checkboxes";

type toggleFeatureNameType = 'sendConfirmationSMS' | 'sendTrialCodeSMS' | 'calculateReservationCost';

export class AdminReservationPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);
    calendar = new Calendar(this.page);
    filters = new AdminFilters(this.page);
    reservationForm = new ReservationForm(this.page);

    public getReservationFormFeatureToggleLocator(toggleFeatureName: toggleFeatureNameType) {
        const engToPolishLabelMap = {
            'sendConfirmationSMS': 'Wyślij SMS potwierdzający',
            'sendTrialCodeSMS': 'Wyślij SMS z kodem na próbę',
            'calculateReservationCost': 'Wylicz koszt rezerwacji',
        } as const;
        return this.page.locator('label').filter({has: this.page.getByLabel(engToPolishLabelMap[toggleFeatureName])});
    }

    private getReservationFormFeatureToggleComponent(toggleFeatureName: toggleFeatureNameType) {
        return new Checkboxes(this.page, this.getReservationFormFeatureToggleLocator(toggleFeatureName));
    }

    public async ensureReservationFormFeatureStateToBe(toggleFeatureName: toggleFeatureNameType, state: checkboxStateType) {
        await this.getReservationFormFeatureToggleComponent(toggleFeatureName).ensureCheckboxStateToBe(state);
    }

    public async expectReservationFormFeatureStateToBe(toggleFeatureName: toggleFeatureNameType, expectedState: checkboxStateType) {
        await this.getReservationFormFeatureToggleComponent(toggleFeatureName).expectCheckboxStateToBe(expectedState);
    }

    public get calendarElement() {
        return this.page.locator('.reservation__calendar');
    }
}