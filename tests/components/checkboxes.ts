import {expect, Locator, Page} from "@playwright/test";

export type checkboxStateType = 'checked' | 'unchecked';

export class Checkboxes {
    constructor(private page: Page, private toggleElement: string | Locator) {
    }

    selectedCheckboxClass = '.Mui-checked';

    public get selectedCheckboxLocator() {
        if (typeof this.toggleElement === 'string') {
            return this.page.locator(this.toggleElement + this.selectedCheckboxClass);
        } else {
            return this.toggleElement.locator(`span${this.selectedCheckboxClass}`);
        }
    }

    public async isCheckboxSelected() {
        if (await this.selectedCheckboxLocator.isVisible()) {
            return true;
        }
    }

    public async ensureCheckboxStateToBe(state: checkboxStateType) {
        let toggleCheckbox;

        if (typeof this.toggleElement === 'string') {
            toggleCheckbox = this.page.locator(this.toggleElement + ' [role="switch"]');
        } else {
            toggleCheckbox = this.toggleElement.locator('[role="switch"]');
        }

        if (state === 'checked') {
            if (!await this.isCheckboxSelected()) {
                await toggleCheckbox.click();
            }
            await expect(toggleCheckbox).toBeChecked();
        }
        if (state === 'unchecked') {
            if (await this.isCheckboxSelected()) {
                await toggleCheckbox.click();
            }
            await expect(toggleCheckbox).not.toBeChecked();
        }
    }

    public async expectCheckboxStateToBe(expectedState: checkboxStateType) {
        if (expectedState === 'checked') {
            await expect(this.selectedCheckboxLocator).toBeVisible();
        }
        if (expectedState === 'unchecked') {
            await expect(this.selectedCheckboxLocator).toBeHidden();
        }
    }
}