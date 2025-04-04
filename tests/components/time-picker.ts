import {Page} from "@playwright/test";

export class TimePicker {
    constructor(private page: Page) {
    }

    public async selectTime(hour: number) {
        await this.page.locator('span').getByText(String(hour), {exact: true}).last().click({ force: true });
        await this.accept();
    }

    public async cancel() {
        await this.page.getByRole('button', {name: 'Cancel'}).click();
    }

    public async accept() {
        await this.page.getByRole('button', {name: 'OK'}).click();
    }
}