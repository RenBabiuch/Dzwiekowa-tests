import {expect, Page} from "@playwright/test";

type weekDayType = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export class Calendar {
    constructor(private page: Page) {
    }

    public get weekDateRangeElement() {
        return this.page.locator('.fc-toolbar.fc-header-toolbar');
    }

    public async expectDateAndHourToBeVisibleOnCalendarElement(year: string, month: string, day: string, hour: string) {
        await expect(this.page.locator(`.fc-widget-content [data-date="${year}-${month}-${day}"]`)).toBeVisible();
        await expect(this.page.locator(`[data-time="${hour}:00:00"]`)).toBeVisible();
    }

    // WIP
    public async selectDate(weekDay: weekDayType, hour: string) {
        const mapDayToNumb = {
            'Mon': 0,
            'Tue': 1,
            'Wed': 2,
            'Thu': 3,
            'Fri': 4,
            'Sat': 5,
            'Sun': 6
        }

        await this.page.locator('.fc-row.fc-widget-header').locator('>=data-date').nth(mapDayToNumb[weekDay]);
        await this.page.locator(`.fc-widget-content [data-test="reservation-entry-${mapDayToNumb[weekDay] + 1}-${hour}"]`).click();
    }

    public get generateTodayDate() {
        const today = new Date();
        return today.toISOString().substring(0, 10);
    }

    public getCalendarDayElement(date: string) {
        return this.page.locator(`.fc-day.fc-widget-content[data-date="${date}"]`);
    }

    public async expectCalendarToShowCorrectDateIndicatedAsToday() {
        const todayCalendarDate = await this.page.locator('.fc-today').last().getAttribute('data-date');
        expect(todayCalendarDate).toEqual(this.generateTodayDate);
    }

    public async showCurrentWeekOnCalendar() {
        await this.page.getByRole('button', {name: "Dziś"}).click();
    }

    public async goToNextWeekOnCalendar() {
        await this.page.getByLabel('next').click();
    }

    public async goToPreviousWeekOnCalendar() {
        await this.page.getByLabel('prev').click();
    }

    public async expectDateToBeVisibleInWeekDateRange(date: string) {

        const formatted = {
            day: date.substring(8,10),
            month: date.substring(5,7),
            year: date.substring(0,4),
        } as const;

        const numToMonthNamesMap = {
            '01': 'sty',
            '02': 'lut',
            '03': 'mar',
            '04': 'kwi',
            '05': 'maj',
            '06': 'cze',
            '07': 'lip',
            '08': 'sie',
            '09': 'wrz',
            '10': 'paź',
            '11': 'lis',
            '12': 'gru',
        } as const;

        const monthName = numToMonthNamesMap[formatted.month];

        await expect(this.weekDateRangeElement).toContainText(formatted.day);
        await expect(this.weekDateRangeElement).toContainText(monthName);
        await expect(this.weekDateRangeElement).toContainText(formatted.year);
    }

    public async getDateByWeekDay(weekDay: weekDayType) {

        const mapWeekDayToNumb = {
            'Mon': 0,
            'Tue': 1,
            'Wed': 2,
            'Thu': 3,
            'Fri': 4,
            'Sat': 5,
            'Sun': 6
        }

        return this.page.locator('.fc-day.fc-widget-content[data-date]').nth(mapWeekDayToNumb[weekDay]).getAttribute('data-date');
    }
}