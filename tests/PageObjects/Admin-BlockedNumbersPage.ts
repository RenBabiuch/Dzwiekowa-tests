import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {getFormattedDate} from "../utils/date-format";
import {getFormattedHours} from "../utils/time-format";
import {removeSpacesFromPhoneNumberIfNeeded} from "../utils/phone-number-format";

const blockTypePolToEngNameMap = {
     'Zablokowany': 'blocked',
     'Wymuś płatność online': 'only_online'
} as const;

type blockType = keyof typeof blockTypePolToEngNameMap;

export class AdminBlockedNumbersPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);

    public get blockPhoneNumberInput() {
        return this.page.getByTestId('block-new-number').last().locator('input');
    }

    public async enterPhoneNumberToBlock(phoneNumber: string) {
        await this.blockPhoneNumberInput.fill(phoneNumber);
    }

    public async expectBlockedPhoneNumberToBe(phoneNumber: string) {
        const formattedPhoneNumber = removeSpacesFromPhoneNumberIfNeeded(phoneNumber);
        await expect(this.blockPhoneNumberInput).toHaveValue(`+48${formattedPhoneNumber}`);
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

    public getBlockedNumberElement(phoneNumber: string) {
        const formattedPhoneNumber = removeSpacesFromPhoneNumberIfNeeded(phoneNumber);
        return this.page.getByTestId(`blocked-row-+48${formattedPhoneNumber}`);
    }

    public unlockNumberButton(phoneNumber: string) {
        const formattedPhoneNumber = removeSpacesFromPhoneNumberIfNeeded(phoneNumber);
        return this.page.getByTestId(`unblock-+48${formattedPhoneNumber}`);
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
        const formattedDate = getFormattedDate(date);
        const formattedStartAndEndHours = getFormattedHours(startHour, endHour);

        await expect(this.getReservationDetailsOfBlockedNumberElement(phoneNumber).getByText(`${formattedDate}`)).toBeVisible();
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