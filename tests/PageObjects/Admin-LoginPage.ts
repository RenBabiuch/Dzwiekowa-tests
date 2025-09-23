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

    public async loginTheUser(defaultPassword = '12345') {
        await this.enterUserPassword(defaultPassword);
        await this.loginButton.click();
    }
}