import {Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {Calendar} from "../components/calendar";
import {AdminFilters} from "../components/admin-filters";
import {ReservationForm} from "../components/reservation-form";
import {ReservationPagePO} from "./ReservationPage";

export class AdminReservationPagePO {
    private locators: ReservationPagePO;

    constructor(private page: Page) {
        this.locators = new ReservationPagePO(page);
    }

    adminHeader = new AdminHeader(this.page);
    calendar = new Calendar(this.page);
    filters = new AdminFilters(this.page);
    reservationForm = new ReservationForm(this.page);

    public get calendarElement() {
        return this.page.locator('.reservation__calendar');
    }

    public async submitWithCashPayment() {
        await this.locators.submitWithCashPayment();
    }

    public async expectReservationToBeCreated(inputDate: string, startHour: number, bandName: string, successfulAlert = true, adminPanel = true) {
        await this.locators.expectReservationToBeCreated(inputDate, startHour, bandName, successfulAlert, adminPanel);
    }
}