import {expect, Locator, Page} from "@playwright/test";

export class AdminCheckboxes {
    constructor(private page: Page) {
    }

    checkedCheckboxClass = '.Mui-checked';

    public get sendConfirmationSMSLabelSelector() {
        return this.page.getByLabel('Wyślij SMS potwierdzający');
    }

    public get sendTrialCodeSMSLabelSelector() {
        return this.page.getByLabel('Wyślij SMS z kodem na próbę');
    }

    public get calculateReservationCostLabelSelector() {
        return this.page.getByLabel('Wylicz koszt rezerwacji');
    }

    public getCheckboxElement(checkboxName: Locator) {
        return this.page.locator('label').filter({has: checkboxName}).locator('span').first();
    }

    public async isCheckboxChecked(checkboxName: Locator) {

        const checkedCheckboxClassIsVisible = await this.getCheckboxElement(checkboxName).locator(this.checkedCheckboxClass).isVisible();
        if (checkedCheckboxClassIsVisible) {
            return true;
        }
    }

    public async expectCheckboxToBeUnchecked(checkboxName: Locator) {
        if(await this.isCheckboxChecked(checkboxName)) {
            await this.getCheckboxElement(checkboxName).click();
        }
        await expect(this.getCheckboxElement(checkboxName)).not.toHaveClass('.Mui-checked');
    }
}