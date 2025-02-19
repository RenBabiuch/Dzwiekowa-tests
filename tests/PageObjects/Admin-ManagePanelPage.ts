import {Page} from "@playwright/test";

export class AdminManagePanelPagePO {
    constructor(private page: Page) {
    }

    public get manageAdminPanelInfo() {
        return this.page.getByText('Jesteś w Panelu Zarządzania', {exact: true});
    }

    public get calendarElement() {
        return this.page.locator('.reservation__calendar');
    }
}