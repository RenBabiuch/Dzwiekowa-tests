import {expect, Page} from "@playwright/test";

export class Checkboxes {
    constructor(private page: Page, private label: string) {
    }

    checkedCheckboxClass = '.Mui-checked';

    private get labelSelector() {
        return this.page.getByLabel(this.label);
    }

    public getCheckboxElement() {
        return this.page.locator('label').filter({has: this.labelSelector}).locator('span').first();
    }

    public async isCheckboxChecked() {
        const checkedCheckboxClassIsVisible = await this.getCheckboxElement().locator(this.checkedCheckboxClass).isVisible();
        if (checkedCheckboxClassIsVisible) {
            return true;
        }
    }

    public async expectCheckboxToBeUnchecked() {
        if (await this.isCheckboxChecked()) {
            await this.getCheckboxElement().click();
        }
        await expect(this.getCheckboxElement()).not.toHaveClass('.Mui-checked');
    }
}