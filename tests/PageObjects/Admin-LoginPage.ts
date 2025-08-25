import {Page} from "@playwright/test";

export class AdminLoginPagePO {
    constructor(private page: Page) {
    }

    public get passwordInput() {
        return this.page.getByTestId('password-input').locator('input');
    }

    public async enterUserPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    public get loginButton() {
        return this.page.getByTestId('login-button');
    }

    public async loginTheUser(password: string) {
        await this.enterUserPassword(password);
        await this.loginButton.click();
    }
}