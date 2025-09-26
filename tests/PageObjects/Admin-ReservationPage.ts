import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {Calendar} from "../components/calendar";
import {AdminFilters} from "../components/admin-filters";
import {ReservationForm} from "../components/reservation-form";
import {AdminCheckboxes} from "../components/admin-checkboxes";

type checkboxNameType = 'sendConfirmationSMS' | 'sendTrialCodeSMS' | 'calculateReservationCost';

export class AdminReservationPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);
    calendar = new Calendar(this.page);
    filters = new AdminFilters(this.page);
    reservationForm = new ReservationForm(this.page);
    private checkboxes = new AdminCheckboxes(this.page);

     checkboxNameToLabelSelectorMap = {
        'sendConfirmationSMS': this.checkboxes.sendConfirmationSMSLabelSelector,
        'sendTrialCodeSMS': this.checkboxes.sendTrialCodeSMSLabelSelector,
        'calculateReservationCost': this.checkboxes.calculateReservationCostLabelSelector,
    } as const;

    public get calendarElement() {
        return this.page.locator('.reservation__calendar');
    }

    public async expectCheckboxElementToBeVisible(checkboxName: checkboxNameType) {
        await expect(this.checkboxes.getCheckboxElement(this.checkboxNameToLabelSelectorMap[checkboxName])).toBeVisible();
    }

    public async ensureCheckboxIsUnchecked(checkboxName: checkboxNameType) {
        await this.expectCheckboxElementToBeVisible(checkboxName);
        await this.checkboxes.expectCheckboxToBeUnchecked(this.checkboxNameToLabelSelectorMap[checkboxName]);
    }
}