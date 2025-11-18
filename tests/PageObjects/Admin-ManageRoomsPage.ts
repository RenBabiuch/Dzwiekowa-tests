import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {adminReservationType} from "../components/admin-filters";
import {Checkboxes, checkboxStateType} from "../components/checkboxes";

export type roomNameType = 'Browar' | 'Młyn' | 'Tęczowa 57';
export type rehearsalContainerTypes = roomNameType | 'add new';

export class AdminManageRoomsPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);

    public getRoomSelector(roomName: roomNameType) {
        return `[data-test="room-${roomName}"]`;
    }

    public getRoomContainer(roomName: roomNameType) {
        return this.page.locator(this.getRoomSelector(roomName));
    }

    public get newRoomSelector() {
        return '[data-test="new-room"]';
    }

    public get newRoomContainer() {
        return this.page.locator(this.newRoomSelector);
    }

    public getRoomNameInput(rehearsalRoom: rehearsalContainerTypes) {
        const roomNameInput = this.page.getByTestId('room-name-input').locator('div input');

        if(rehearsalRoom === 'add new') {
            return this.newRoomContainer.locator(roomNameInput);
        } else {
            return this.getRoomContainer(rehearsalRoom).locator(roomNameInput);
        }
    }

    public async enterRoomName(rehearsalRoom: rehearsalContainerTypes, roomName: string) {
        await this.getRoomNameInput(rehearsalRoom).fill(roomName);
    }

    public getRoomAddressInput(rehearsalRoom: rehearsalContainerTypes) {
        const roomAddressInput = this.page.getByTestId('room-address-input').locator('div input');

        if(rehearsalRoom === 'add new') {
            return this.newRoomContainer.locator(roomAddressInput);
        } else {
            return this.getRoomContainer(rehearsalRoom).locator(roomAddressInput);
        }
    }

    public async enterRoomAddress(rehearsalRoom: rehearsalContainerTypes, address: string) {
        await this.getRoomAddressInput(rehearsalRoom).fill(address);
    }

    public getRoomColorButton(rehearsalRoom: rehearsalContainerTypes) {
        const roomColorButton = this.page.getByTestId('room-color-input');

        if(rehearsalRoom === 'add new') {
            return this.newRoomContainer.locator(roomColorButton);
        } else {
            return this.getRoomContainer(rehearsalRoom).locator(roomColorButton);
        }
    }

    public get roomColorContainer() {
        return this.page.locator('.MuiBox-root');
    }

    public async selectRoomColor(rehearsalRoom: rehearsalContainerTypes, defaultHexColorCode = '#2A1D5B') {
        const hexColorCodeInput = this.roomColorContainer.locator('input');

        await this.getRoomColorButton(rehearsalRoom).click();
        await expect(this.roomColorContainer).toBeVisible();
        await expect(hexColorCodeInput).toBeVisible();
        await hexColorCodeInput.clear();
        await hexColorCodeInput.fill(defaultHexColorCode);
        await this.page.keyboard.press('Escape');
        await expect(this.roomColorContainer).not.toBeVisible();
    }

    public getRoomKeyInput(rehearsalRoom: rehearsalContainerTypes) {
        const roomKeyInput = this.page.getByTestId('room-roomKeys-input').locator('input');

        if(rehearsalRoom === 'add new') {
            return this.newRoomContainer.locator(roomKeyInput);
        } else {
            return this.getRoomContainer(rehearsalRoom).locator(roomKeyInput);
        }
    }

    public async enterRoomKey(rehearsalRoom: rehearsalContainerTypes, roomKey: string) {
        await this.getRoomKeyInput(rehearsalRoom).fill(roomKey);
    }

    public getRoomConfirmationMessageInput(rehearsalRoom: rehearsalContainerTypes) {
        const roomConfirmationMessageInput = this.page.getByTestId('room-confirmReservationText-input').locator('textarea').first();

        if(rehearsalRoom === 'add new') {
            return this.newRoomContainer.locator(roomConfirmationMessageInput);
        } else {
            return this.getRoomContainer(rehearsalRoom).locator(roomConfirmationMessageInput);
        }
    }

    public async enterRoomConfirmationMessage(rehearsalRoom: rehearsalContainerTypes, confirmationMessage: string) {
        await this.getRoomConfirmationMessageInput(rehearsalRoom).fill(confirmationMessage);
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

    public getSMSBeforeStartReservationInput(rehearsalRoom: rehearsalContainerTypes, reservationType: adminReservationType) {
        const number = this.getReservationTypeToNumber(reservationType);
        const smsBeforeStartReservationInput = this.page.getByTestId(`room-keysText-${number}-input`).first().locator(' div textarea').first();

        if(rehearsalRoom === 'add new') {
            return this.newRoomContainer.locator(smsBeforeStartReservationInput);
        } else {
            return this.getRoomContainer(rehearsalRoom).locator(smsBeforeStartReservationInput);
        }
    }

    public async enterSmsMessageBeforeStartReservation(rehearsalRoom: rehearsalContainerTypes, reservationType: adminReservationType, message: string) {
        await this.getSMSBeforeStartReservationInput(rehearsalRoom, reservationType).fill(message);
    }

    public getReservationTypeToggleSelector(rehearsalRoom: rehearsalContainerTypes, reservationType: adminReservationType) {
        const number = this.getReservationTypeToNumber(reservationType);
        const typeToggleSelector = `[data-test="room-reservationType-${number}-toggle"]`;

        if(rehearsalRoom === 'add new') {
            return `${this.newRoomSelector} ${typeToggleSelector}`;
        } else {
            return `${this.getRoomSelector(rehearsalRoom)} ${typeToggleSelector}`;
        }
    }

    private getReservationTypeToggleComponent(rehearsalRoom: rehearsalContainerTypes, reservationType: adminReservationType) {
        const toggleSelector = this.getReservationTypeToggleSelector(rehearsalRoom, reservationType);
        return new Checkboxes(this.page, toggleSelector);
    }

    public getReservationTypeCheckbox(rehearsalRoom: rehearsalContainerTypes, reservationType: adminReservationType) {
        return this.page.locator(this.getReservationTypeToggleSelector(rehearsalRoom, reservationType) + ' [role="switch"]');
    }

    public async ensureReservationTypeStateToBe(rehearsalRoom: rehearsalContainerTypes, reservationType: adminReservationType, state: checkboxStateType) {
        await this.getReservationTypeToggleComponent(rehearsalRoom, reservationType).ensureCheckboxStateToBe(state);
    }

    public async expectReservationTypeStateToBe(rehearsalRoom: rehearsalContainerTypes, reservationType: adminReservationType, expectedState: checkboxStateType) {
        await this.getReservationTypeToggleComponent(rehearsalRoom, reservationType).expectCheckboxStateToBe(expectedState);
    }

    public async configureReservationType(rehearsalRoom: rehearsalContainerTypes, reservationType: adminReservationType, message: string, reservationTypeState: checkboxStateType) {
        await this.enterSmsMessageBeforeStartReservation(rehearsalRoom, reservationType, message);
        await this.ensureReservationTypeStateToBe(rehearsalRoom, reservationType,reservationTypeState);
    }

    public getRoomHiddenToggleSelector(rehearsalRoom: rehearsalContainerTypes) {
        const roomHiddenToggleSelector = '[data-test="room-hidden-toggle"]';

        if(rehearsalRoom === 'add new') {
            return `${this.newRoomSelector} ${roomHiddenToggleSelector}`;
        } else {
            return `${this.getRoomSelector(rehearsalRoom)} ${roomHiddenToggleSelector}`;
        }
    }

    private getRoomHiddenToggleComponent(rehearsalRoom: rehearsalContainerTypes) {
        const roomHiddenToggle = this.getRoomHiddenToggleSelector(rehearsalRoom);
        return new Checkboxes(this.page, roomHiddenToggle);
    }

    public getRoomHiddenCheckbox(rehearsalRoom: rehearsalContainerTypes) {
        return this.page.locator(this.getRoomHiddenToggleSelector(rehearsalRoom) + ' [role="switch"]');
    }

    public async ensureRoomHiddenStateToBe(rehearsalRoom: rehearsalContainerTypes, state: checkboxStateType){
        await this.getRoomHiddenToggleComponent(rehearsalRoom).ensureCheckboxStateToBe(state);
    }

    public async expectRoomHiddenStateToBe(rehearsalRoom: rehearsalContainerTypes, expectedState: checkboxStateType) {
        await this.getRoomHiddenToggleComponent(rehearsalRoom).expectCheckboxStateToBe(expectedState);
    }

    public getSubmitButton(rehearsalRoom: rehearsalContainerTypes) {
        const submitButton = this.page.getByTestId('room-submit-button');

        if(rehearsalRoom === 'add new') {
            return this.newRoomContainer.locator(submitButton);
        } else {
            return this.getRoomContainer(rehearsalRoom).locator(submitButton);
        }
    }

    public async clickToSubmit(rehearsalRoom: rehearsalContainerTypes) {
        await this.getSubmitButton(rehearsalRoom).click();
    }

    public async enterBasicDataToAddNewRehearsalRoom(roomName: string, address: string, roomKey: string, confirmationMessage: string) {
        await this.enterRoomName('add new', roomName);
        await this.enterRoomAddress('add new', address);
        await this.selectRoomColor('add new');
        await this.enterRoomKey('add new', roomKey);
        await this.enterRoomConfirmationMessage('add new', confirmationMessage);
    }
}
