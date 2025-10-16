import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {Calendar} from "../components/calendar";
import {AdminFilters} from "../components/admin-filters";
import {ReservationForm} from "../components/reservation-form";
import {Checkboxes} from "../components/checkboxes";

type checkboxNameType = 'sendConfirmationSMS' | 'sendTrialCodeSMS' | 'calculateReservationCost';

export class AdminReservationPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);
    calendar = new Calendar(this.page);
    filters = new AdminFilters(this.page);
    reservationForm = new ReservationForm(this.page);
    private checkboxes = {
        'sendConfirmationSMS': new Checkboxes(this.page, 'Wyślij SMS potwierdzający'),
        'sendTrialCodeSMS': new Checkboxes(this.page, 'Wyślij SMS z kodem na próbę'),
        'calculateReservationCost': new Checkboxes(this.page, 'Wylicz koszt rezerwacji')
    } as const;

    public get calendarElement() {
        return this.page.locator('.reservation__calendar');
    }

    public async expectCheckboxElementToBeVisible(checkboxName: checkboxNameType) {
        await expect(this.checkboxes[checkboxName].getCheckboxElement()).toBeVisible();
    }

    public async ensureCheckboxIsUnchecked(checkboxName: checkboxNameType) {
        await this.expectCheckboxElementToBeVisible(checkboxName);
        await this.checkboxes[checkboxName].expectCheckboxToBeUnchecked();
    }
}