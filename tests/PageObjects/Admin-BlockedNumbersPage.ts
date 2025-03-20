import {Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";

type blockType = 'blocked' | 'enforce-online-payment';

export class AdminBlockedNumbersPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);

    public get blockNumberInput() {
        return this.page.getByTestId('block-new-number');
    }

    public async enterNumberToBlock(phoneNumber: string) {
        await this.blockNumberInput.fill(phoneNumber);
    }

    public async selectBlockType(blockName: blockType) {

        const engToPolishNameMap = {
            'blocked': 'Zablokowany',
            'enforce-online-payment': 'Wymuś płatność online'
        }

        await this.page.getByTestId('block-new-type').click();
        await this.page.getByRole('menuitem').getByText(engToPolishNameMap[blockName]).click();
    }

    public get blockNumberReasonInput() {
        return this.page.getByTestId('block-new-reason');
    }

    public async enterBlockNumberReason(reason: string) {
        await this.blockNumberReasonInput.fill(reason);
    }

    public async fillTheBlockNumberForm(phoneNumber: string, blockName: blockType, reason: string) {
        await this.enterNumberToBlock(phoneNumber);
        await this.selectBlockType(blockName);
        await this.enterBlockNumberReason(reason);
    }

    public get saveButton() {
        return this.page.getByTestId('block-new-number-submit');
    }

    public async confirmNumberBlocking() {
        await this.saveButton.click();
    }

    public get blockedNumbersContainer() {
        return this.page.locator('.block-numbers__container').getByText('Obecnie zablokowane numery');
    }

    public async blockedNumberElement(phoneNumber: string) {
        return this.page.getByTestId(`blocked-row-+48${phoneNumber}`);
    }

    public unlockNumberButton(phoneNumber: string) {
        return this.page.getByTestId(`unblock-+48${phoneNumber}`);
    }

    public async unlockPhoneNumber(phoneNumber: string) {
        await this.unlockNumberButton(phoneNumber).click();
    }
}