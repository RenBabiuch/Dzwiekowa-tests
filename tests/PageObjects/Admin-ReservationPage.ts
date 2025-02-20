import {Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";

export class AdminReservationPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);

    public get calendarElement() {
        return this.page.locator('.reservation__calendar');
    }
}