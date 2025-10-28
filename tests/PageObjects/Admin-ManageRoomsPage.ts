import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {adminReservationType} from "../components/admin-filters";

//type roomNameType = 'Browar' | 'Stary Młyn';
export type roomNameType = 'Browar' | 'Młyn' | 'Tęczowa 57';

export class AdminManageRoomsPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);

    public getRoomContainer(roomName: roomNameType) {
        return this.page.getByTestId(`room-${roomName}`);
    }

    public get newRoomContainer() {
        return this.page.getByTestId('new-room');
    }

    public get roomNameInput() {
        return this.newRoomContainer.getByTestId('room-name-input').locator('div input');
    }

    public async enterRoomName(name: string) {
        await this.roomNameInput.fill(name);
    }

    public get roomAddressInput() {
        return this.newRoomContainer.getByTestId('room-address-input').locator('div input');
    }

    public async enterRoomAddress(address: string) {
        await this.roomAddressInput.fill(address);
    }

    // room-confirmReservationText-input

    public get roomColorButton() {
        return this.newRoomContainer.getByTestId('room-color-input');
    }

    public get roomColorContainer() {
        return this.page.locator('.MuiBox-root');
    }

    public async selectRoomColor(defaultHexColorCode = '#2A1D5B') {
        const hexColorCodeInput = this.roomColorContainer.locator('input');

        await this.roomColorButton.click();
        await expect(this.roomColorContainer).toBeVisible();
        await expect(hexColorCodeInput).toBeVisible();
        await hexColorCodeInput.clear();
        await hexColorCodeInput.fill(defaultHexColorCode);
        await this.page.keyboard.press('Escape');
        await expect(this.roomColorContainer).not.toBeVisible();
    }

    public get roomConfirmationTextInput() {
        return this.newRoomContainer.getByTestId('room-confirmReservationText-input').locator('textarea').first();
    }

    public getReservationTypeToNumber(reservationType: adminReservationType) {

        if (reservationType === 'Solo') {
            return '1';
        }
        if (reservationType === 'Nagrywka') {
            return '2';
        }
        if (reservationType === 'Solo z talerzami') {
            return '3';
        }
        if (reservationType == 'Zespół') {
            return '4';
        }
        if (reservationType === 'Lekcja/Duet') {
            return '5';
        }
        if (reservationType === 'Próba 5+więcej') {
            return '6';
        }
    }

    public getSMSBeforeStartReservationInput(reservationType: adminReservationType) {
        const number = this.getReservationTypeToNumber(reservationType);
        return this.newRoomContainer.getByTestId(`room-keysText-${number}-input`).first().locator(' div textarea').first();
    }

    public reservationTypeToggle(reservationType: adminReservationType) {
        const number = this.getReservationTypeToNumber(reservationType);
        return this.newRoomContainer.getByTestId(`room-reservationType-${number}-toggle`);
    }

    public getReservationCheckboxElement(reservationType: adminReservationType) {
        return this.reservationTypeToggle(reservationType).getByRole('switch');
    }

    public async isCheckboxChecked(reservationType: adminReservationType) {
        const checkedCheckboxClassIsVisible = await this.reservationTypeToggle(reservationType).locator('.Mui-checked').isVisible();

        if(checkedCheckboxClassIsVisible) {
            return true;
        }
    }

    public async ensureCheckboxToBeChecked(reservationType: adminReservationType) {
        if(!await this.isCheckboxChecked(reservationType)) {
            await this.getReservationCheckboxElement(reservationType).click();
        }
        // await expect(this.reservationTypeToggle(reservationType)).toHaveClass('.Mui-checked');
        // await expect(this.reservationTypeToggle(reservationType)).toHaveClass('.Mui-checked');
        await expect(this.getReservationCheckboxElement(reservationType)).toBeChecked();
    }

    public get submitButton() {
        return this.newRoomContainer.getByTestId('room-submit-button');
    }

    public async clickSubmitButtonToAddRehearsalRoom() {
        await this.submitButton.click();
    }


}