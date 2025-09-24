import {Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {Calendar} from "../components/calendar";
import {AdminFilters} from "../components/admin-filters";
import {ReservationForm} from "../components/reservation-form";

export class AdminReservationPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);
    calendar = new Calendar(this.page);
    filters = new AdminFilters(this.page);
    reservationForm = new ReservationForm(this.page);

    public get calendarElement() {
        return this.page.locator('.reservation__calendar');
    }
}