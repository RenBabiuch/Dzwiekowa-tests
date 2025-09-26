import {Page} from "@playwright/test";

export class AdminHeader {
    constructor(private page: Page) {
    }

    public get loggedToAdminPanelInfo() {
        return this.page.getByText('Panel Zarządzania', {exact: true});
    }

    public get manageRoomButton() {
        return this.page.getByTestId('manage-rooms');
    }

    public async goToManageRooms() {
        await this.manageRoomButton.click();
    }

    public get blockedNumbersButton() {
        return this.page.getByTestId('manage-blocked-numbers');
    }

    public async goToBlockNumbers() {
        await this.blockedNumbersButton.click();
    }

    public get logoutButton() {
        return this.page.getByTestId('logout');
    }

    public async logoutTheUser() {
        await this.logoutButton.click();
    }

    public get manageReservationsButton() {
        return this.page.getByTestId('manage-reservations');
    }

    public async goToManageReservations() {
        await this.manageReservationsButton.click();
    }

    public get notepadButton() {
        return this.page.getByTestId('notepad');
    }

    public async goToNotepad() {
        await this.notepadButton.click();
    }

    public get settlementButton() {
        return this.page.getByTestId('reservation-list');
    }

    public async goToSettlement() {
        await this.settlementButton.click();
    }
}