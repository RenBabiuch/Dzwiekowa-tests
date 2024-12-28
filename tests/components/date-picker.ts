import {Page} from "@playwright/test";

export class DatePicker {
    constructor(private page: Page) {
    }

    public async selectDay(day: string) {
        await this.page.getByRole('button', {name: `${day}`}).click();
    }
}