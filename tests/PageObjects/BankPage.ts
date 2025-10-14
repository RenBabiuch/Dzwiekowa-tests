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
        let attempt = 0;
        // nothing happens when clicking the button too fast
            await expect(async () => {
                attempt++;

                if (attempt === 4) {
                    await this.page.reload();
                    await this.page.waitForTimeout(2_000);
                }
                await this.payButton.click();
                // try again if the button doesn't disappear
                await expect(this.payButton).not.toBeVisible({timeout: 2_000});
        }).toPass({timeout: 30_000})
    }
}