import {expect, Page} from "@playwright/test";

export class DatePicker {
    constructor(private page: Page) {
    }

    public async selectDay(day: Date) {

        const monthAndYearInCalendar = await this.page.locator('.MuiPickersCalendarHeader-label').textContent();
        const monthInCalendarSubstring = monthAndYearInCalendar.split('').reverse().join('').substring(5);
        const monthInCalendar = monthInCalendarSubstring.split('').reverse().join('');

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

        const targetDay = day.getDate();
        const targetMonth = day.getMonth();

        if(monthInCalendar === numbToMonthsMap[targetMonth]) {
            await expect(this.page.getByText(numbToMonthsMap[targetMonth])).toBeVisible();
            await this.page.getByRole('gridcell', {name: `${targetDay}`, exact: true}).nth(0).click();
        } else {
            await this.page.keyboard.press('ArrowRight');
            await expect(this.page.getByText(numbToMonthsMap[targetMonth])).toBeVisible();
            await this.page.getByRole('gridcell', {name: `${targetDay}`, exact: true}).nth(0).click();
        }
    }
}