import {expect, Page} from "@playwright/test";

export class DatePicker {
    constructor(private page: Page) {
    }

    public async selectDay(day: Date) {

        const monthAndYearInCalendar = await this.page.locator('[direction="up"] div').last().textContent();
        const monthInCalendarSubstring = monthAndYearInCalendar.split('').reverse().join('').substring(5);
        const monthInCalendar = monthInCalendarSubstring.split('').reverse().join('');

        const numbToMonthsMap = {
            0: 'January',
            1: 'February',
            2: 'March',
            3: 'April',
            4: 'May',
            5: 'June',
            6: 'July',
            7: 'August',
            8: 'September',
            9: 'October',
            10: 'November',
            11: 'December'
        }

        const targetDay = day.getDate();
        const targetMonth = day.getMonth();

        if(monthInCalendar === numbToMonthsMap[targetMonth]) {
            await expect(this.page.getByText(numbToMonthsMap[targetMonth])).toBeVisible();
            await this.page.getByRole('button', {name: `${targetDay}`, exact: true}).nth(0).click();
        } else {
            await this.page.keyboard.press('ArrowRight');
            await expect(this.page.getByText(numbToMonthsMap[targetMonth])).toBeVisible();
            await this.page.getByRole('button', {name: `${targetDay}`, exact: true}).nth(0).click();
        }
    }
}