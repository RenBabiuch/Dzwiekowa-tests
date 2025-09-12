import {expect, Page} from "@playwright/test";

type weekDayType = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

const mapWeekDayToNumb = {
    'Mon': 0,
    'Tue': 1,
    'Wed': 2,
    'Thu': 3,
    'Fri': 4,
    'Sat': 5,
    'Sun': 6
} as const;

export class Calendar {
    constructor(private page: Page) {
    }

    public get dateInHeader() {
        return this.page.locator('.fc-row.fc-widget-header');
    }

    public get weekDateRangeElement() {
        return this.page.locator('.fc-toolbar.fc-header-toolbar');
    }

    // WIP
    public async selectDate(weekDay: weekDayType, hour: string) {

        await this.dateInHeader.locator('>=data-date').nth(mapWeekDayToNumb[weekDay]);
        await this.page.locator(`.fc-widget-content [data-test="reservation-entry-${mapWeekDayToNumb[weekDay] + 1}-${hour}"]`).click();
    }

    public get generateTodayDate() {
        const today = new Date();
        return today.toISOString().substring(0, 10);
    }

    public getDayElement(date?: string) {
        if (date) {
            return this.page.locator(`.fc-day.fc-widget-content[data-date="${date}"]`);
        } else {
            return this.page.locator('.fc-day.fc-widget-content[data-date]');
        }
    }

    public async expectToShowCorrectDateIndicatedAsToday() {
        const todayCalendarDate = await this.page.locator('.fc-today').last().getAttribute('data-date');
        expect(todayCalendarDate).toEqual(this.generateTodayDate);
    }

    public async showCurrentWeek() {
        await this.page.getByRole('button', {name: "Dziś"}).click();
    }

    public async goToNextWeek() {
        await this.page.getByLabel('next').click();
    }

    public async goToPreviousWeek() {
        await this.page.getByLabel('prev').click();
    }

    public async expectDateToBeVisibleInWeekDateRange(date: string) {

        const formatted = {
            day: date.substring(8, 10),
            month: date.substring(5, 7),
            year: date.substring(0, 4),
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
        await expect(this.getDayElement(date)).toBeVisible();
    }

    public async getDateByWeekDay(weekDay: weekDayType) {
        return this.getDayElement().nth(mapWeekDayToNumb[weekDay]).getAttribute('data-date');
    }

    public async getReservationElement(date: string, startHour: number) {
        await expect(this.dateInHeader).toBeVisible();
        const dateInRowSelector = this.page.locator(`.fc-row.fc-widget-header [data-date="${date}"]`);

        if (!await dateInRowSelector.isVisible()) {
            await this.goToNextWeek();
        }

        await expect(dateInRowSelector).toBeVisible();

        const dayWeekName = await dateInRowSelector.innerText();
        const dayWeekNameSubstring = dayWeekName.substring(0, 3);

        const polWeekDaysToNumbMap = {
            'pon': '1',
            'wt ': '2',
            'śr ': '3',
            'czw': '4',
            'pt ': '5',
            'sob': '6',
            'ndz': '7'
        }

        return this.page.getByTestId(`reservation-entry-${polWeekDaysToNumbMap[dayWeekNameSubstring]}-${String(startHour)}`).first();
    }

    public async getPreviewOfReservationElement(date: string, startHour: number, bandName: string) {
        const reservationElem = await this.getReservationElement(date, startHour);
        return reservationElem.getByText(bandName);
    }

    public async getAdminReservationElement(date: string, startHour: number, bandName: string) {
        return await this.getPreviewOfReservationElement(date, startHour, bandName);
    }

    public async expectReservationToBeVisible(date: string, startHour: number, bandName: string, adminPanel = false) {
        const previewOfReservationElem = await this.getPreviewOfReservationElement(date, startHour, bandName);
        const reservationElem = await this.getReservationElement(date, startHour);

        if (adminPanel) {
            await expect(previewOfReservationElem).toBeVisible();
            await expect(reservationElem).toBeVisible();
        } else {
            await expect(previewOfReservationElem).not.toBeVisible();
            await expect(reservationElem).toBeVisible();
        }
    }

    public async clickToSeeReservationDetails(date: string, startHour: number, bandName: string) {
        const previewOfReservationElem = await this.getPreviewOfReservationElement(date, startHour, bandName);
        await previewOfReservationElem.click();
    }

    public async expectReservationToBeMarkedAsFirst(date: string, startHour: number, bandName: string) {
        await expect(await this.getPreviewOfReservationElement(date, startHour, bandName)).toContainText('★');
    }

    public async expectReservationNotToBeMarkedAsFirst(date: string, startHour: number, bandName: string) {
        await expect(await this.getPreviewOfReservationElement(date, startHour, bandName)).not.toContainText('★');
    }
}