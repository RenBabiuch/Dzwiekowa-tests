import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {FormatDateAndTime} from "../components/format-date-and-time";

const blockTypePolToEngNameMap = {
     'Zablokowany': 'blocked',
     'Wymuś płatność online': 'only_online'
} as const;

type blockType = keyof typeof blockTypePolToEngNameMap;

export class AdminBlockedNumbersPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);
    formatDateAndTime = new FormatDateAndTime(this.page);

    public get blockPhoneNumberInput() {
        return this.page.getByTestId('block-new-number').last().locator('input');
    }

    public async enterPhoneNumberToBlock(phoneNumber: string) {
        await this.blockPhoneNumberInput.fill(phoneNumber);
    }

    public async expectBlockedPhoneNumberToBe(phoneNumber: string) {
        const newFormatNumber = this.getFormatPhoneNumberIfNeeded(phoneNumber);
        await expect(this.blockPhoneNumberInput).toHaveValue(`+48${newFormatNumber}`);
    }

    public get blockTypeCombobox() {
        return this.page.getByTestId('block-new-type').nth(1);
    }

    public async expectBlockTypeToBeSelected(blockName: blockType) {
        await expect(this.blockTypeCombobox.locator('input')).toHaveValue(blockTypePolToEngNameMap[blockName]);
    }

    public async selectBlockType(blockName: blockType) {
        await this.blockTypeCombobox.click();
        await this.page.getByRole('listbox').getByText(blockName).click();
    }

    public get blockNumberReasonInput() {
        return this.page.getByTestId('block-new-reason').locator('input');
    }

    public async enterBlockNumberReason(reason: string) {
        await this.blockNumberReasonInput.fill(reason);
    }

    public async fillAndConfirmBlockNumberForm(phoneNumber: string, blockName: blockType, reason: string) {
        await this.enterPhoneNumberToBlock(phoneNumber);
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

    public getFormatPhoneNumberIfNeeded(phoneNumber: string) {

        if(phoneNumber.includes(' ')) {
            // @ts-ignore
            return phoneNumber.replaceAll(' ', '');
        } else {
            return phoneNumber;
        }
    }

    public getBlockedNumberElement(phoneNumber: string) {
        const newFormatNumber = this.getFormatPhoneNumberIfNeeded(phoneNumber);
        return this.page.getByTestId(`blocked-row-+48${newFormatNumber}`);
    }

    public unlockNumberButton(phoneNumber: string) {
        const newFormatNumber = this.getFormatPhoneNumberIfNeeded(phoneNumber);
        return this.page.getByTestId(`unblock-+48${newFormatNumber}`);
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

        const formattedStartAndEndHours = this.formatDateAndTime.getFormattedHours(startHour, endHour);
        await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(`${day}/${month}/${year}`)).toBeVisible();
        await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(`${formattedStartAndEndHours}`)).toBeVisible();
    }

    public async expectReservationPriceOfBlockedNumberToBeVisible(phoneNumber: string, price: string) {
        await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(price)).toBeVisible();
    }

    public async expectReservationDetailsOfBlockedNumberToBeVisible(phoneNumber: string, bandName: string, inputDate: string, startHour: number, endHour: number, price: string) {
        await this.expectBandNameOfBlockedNumberToBeVisible(phoneNumber, bandName);
        await this.expectReservationDateAndHoursOfBlockedNumberToBeVisible(phoneNumber, inputDate, startHour, endHour);
        await this.expectReservationPriceOfBlockedNumberToBeVisible(phoneNumber, price);
    }
}