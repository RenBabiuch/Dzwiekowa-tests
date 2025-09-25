import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";

type blockType = 'blocked' | 'enforce-online-payment';

export class AdminBlockedNumbersPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);

    public get blockNumberInput() {
        return this.page.getByTestId('block-new-number').last().locator('input');
    }

    public async enterNumberToBlock(phoneNumber: string) {
        await this.blockNumberInput.fill(phoneNumber);
    }

    public async selectBlockType(blockName: blockType) {

        const engToPolishNameMap = {
            'blocked': 'Zablokowany',
            'enforce-online-payment': 'Wymuś płatność online'
        }

        await this.page.getByTestId('block-new-type').first().click();
        await this.page.getByRole('listbox').getByText(engToPolishNameMap[blockName]).click();
    }

    public get blockNumberReasonInput() {
        return this.page.getByTestId('block-new-reason').locator('input');
    }

    public async enterBlockNumberReason(reason: string) {
        await this.blockNumberReasonInput.fill(reason);
    }

    public async fillAndConfirmBlockNumberForm(phoneNumber: string, blockName: blockType, reason: string) {
        await this.enterNumberToBlock(phoneNumber);
        await this.selectBlockType(blockName);
        await this.enterBlockNumberReason(reason);
        await this.confirmNumberBlocking();
    }

    public get saveButton() {
        return this.page.getByTestId('block-new-number-submit');
    }

    public async confirmNumberBlocking() {
        await this.saveButton.click();
    }

    public get blockedNumbersContainer() {
        return this.page.getByText('Obecnie zablokowane numery');
    }

    public getBlockedNumberElement(phoneNumber: string) {
        return this.page.getByTestId(`blocked-row-+48${phoneNumber}`);
    }

    public unlockNumberButton(phoneNumber: string) {
        return this.page.getByTestId(`unblock-+48${phoneNumber}`);
    }

    public async unlockPhoneNumber(phoneNumber: string) {
        await this.unlockNumberButton(phoneNumber).click();
    }

    public getReservationDetailsOfBlockedNumberElement(phoneNumber: string) {
        return (this.getBlockedNumberElement(phoneNumber)).locator('~ div.flex.gap-3');
    }

    public async expectBandNameOfBlockedNumberToBeVisible(phoneNumber: string, bandName: string) {
        await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(bandName)).toBeVisible();
    }

    public async expectReservationDateAndHoursOfBlockedNumberToBeVisible(phoneNumber: string, date: string, startHour: number, endHour: number) {

        const day = date.slice(8, 10);
        const month = date.slice(5, 7);
        const year = date.slice(0, 4);

        await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(`${day}/${month}/${year}`)).toBeVisible();

        if (String(startHour).length === 1) {
            await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(`0${startHour}:00-`)).toBeVisible();
        } else {
            await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(`${startHour}:00-`)).toBeVisible();
        }

        if (String(endHour).length === 1) {
            await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(`-0${endHour}:00`)).toBeVisible();
        } else {
            await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(`-${endHour}:00`)).toBeVisible();
        }
    }

    public async expectReservationPriceOfBlockedNumberToBeVisible(phoneNumber: string, price: string) {
        await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(price)).toBeVisible();
    }

    public async expectReservationDetailsOfBlockedNumberToBeVisible(phoneNumber: string, bandName: string, date: string, startHour: number, endHour: number, price: string) {
        await this.expectBandNameOfBlockedNumberToBeVisible(phoneNumber, bandName);
        await this.expectReservationDateAndHoursOfBlockedNumberToBeVisible(phoneNumber, date, startHour, endHour);
        await this.expectReservationPriceOfBlockedNumberToBeVisible(phoneNumber, price);
    }
}