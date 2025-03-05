import {Page} from "@playwright/test";

export class AdminHeader {
    constructor(private page: Page) {
    }

    public get loggedToAdminPanelInfo() {
        return this.page.getByText('Jesteś w Panelu Zarządzania', {exact: true});
    }

    public get manageRoomButton() {
        return this.page.getByTestId('manage-rooms');
    }

    public async goToManageRooms() {
        await this.manageRoomButton.click();
    }

    public get logoutButton() {
        return this.page.getByTestId('logout');
    }

    public async logoutTheUser() {
        await this.logoutButton.click();
    }
}