import {expect, Page} from "@playwright/test";

export class DateAndTimePicker {
    constructor(private page: Page) {
    }

    public get currentMonthLocator() {
        return this.page.locator('.MuiPickersCalendarHeader-label');
    }

    public get nextMonthButton() {
        return this.page.getByLabel('Next month');
    }

    public getDayElement(day: Date) {
        const targetDay = day.getDate();
        return this.page.getByRole('gridcell', {name: `${targetDay}`, exact: true});
    }

    public async selectDay(day: Date) {

        const currentMonthAndYearInCalendar = await this.currentMonthLocator.textContent();
        const currentMonthInCalendar = currentMonthAndYearInCalendar.slice(0, -5);

        const numbToMonthsMap = {
            0: 'styczeń',
            1: 'luty',
            2: 'marzec',
            3: 'kwiecień',
            4: 'maj',
            5: 'czerwiec',
            6: 'lipiec',
            7: 'sierpień',
            8: 'wrzesień',
            9: 'październik',
            10: 'listopad',
            11: 'grudzień'
        }

        const targetMonth = day.getMonth();

        if(currentMonthInCalendar === numbToMonthsMap[targetMonth]) {
            await expect(this.currentMonthLocator).toContainText(numbToMonthsMap[targetMonth]);
            await this.getDayElement(day).click();
        } else {
            await expect(this.nextMonthButton).toBeVisible();
            await this.nextMonthButton.click();
            await expect(this.currentMonthLocator).not.toContainText(`${currentMonthInCalendar}`);
            await expect(this.currentMonthLocator).toContainText(`${numbToMonthsMap[targetMonth]}`);
            await this.getDayElement(day).click();
        }
    }

    public async selectTime(hour: number) {
        await this.page.locator('span').getByText(String(hour), {exact: true}).last().click({ force: true });
    }

    public async selectAndApproveDayAndTime(day: Date, hour: number) {
        await this.selectDay(day);
        await this.selectTime(hour);
        await this.clickToAccept();
        await expect(this.page.locator('.MuiDateCalendar-root')).not.toBeVisible();
    }

    public async clickToCancel() {
        await this.page.getByRole('button', {name: 'Cancel'}).click();
    }

    public async clickToAccept() {
        await this.page.getByRole('button', {name: 'OK'}).click();
    }
}