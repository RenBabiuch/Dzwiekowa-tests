import {expect, Page} from "@playwright/test";

export class BankPagePO {
    constructor(private page: Page) {
    }

    public async expectTransactionAmountToBe(amount: string) {
        await expect(this.page.locator('.panel-body').getByText('PLN')).toContainText(`${amount}.00 PLN`);
    }

    public get userActionsContainer() {
        return this.page.locator('[name = "user_account_pbl"]');
    }

    public get payButton() {
        return this.page.locator('#user_account_pbl_correct');
    }

    public async goToPay() {
        await expect(this.userActionsContainer).toBeVisible();
        await this.page.waitForTimeout(500);
        await this.payButton.click();
    }
}