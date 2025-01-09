import {expect, Page} from "@playwright/test";
import {Header} from "../components/header";
import {DatePicker} from "../components/date-picker";
import {TimePicker} from "../components/time-picker";

export class ReservationPagePO {
    constructor(private page: Page) {
    }

    header = new Header(this.page);
    datePicker = new DatePicker(this.page);
    timePicker = new TimePicker(this.page);

    public async expectDateAndHourToBeVisibleOnCalendarElement(year: string, month: string, day: string, hour: string) {
        await expect(this.page.locator(`.fc-widget-content [data-date="${year}-${month}-${day}"]`)).toBeVisible();
        await expect(this.page.locator(`[data-time="${hour}:00:00"]`)).toBeVisible();
    }

    public get currentDayElement() {
        return this.page.locator('.fc-today');
    }

    // WIP
    public async selectDate(day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', hour: string) {
        const mapDayToNumb = {
            'Mon': 0,
            'Tue': 1,
            'Wed': 2,
            'Thu': 3,
            'Fri': 4,
            'Sat': 5,
            'Sun': 6
        }

        await this.page.locator('.fc-row.fc-widget-header').locator('>=data-date').nth(mapDayToNumb[day]);
        await this.page.locator(`.fc-widget-content [data-test="reservation-entry-${mapDayToNumb[day] +1}-${hour}"]`).click();
    }

    public get reservationFormElement() {
        return this.page.locator('.reservation-form-container');
    }

    public get rehearsalRoomElement() {
        return this.page.getByTestId('form-room');
    }

    public async selectRehearsalRoom(roomName: 'Wszystkie' | 'Browar Miesczanski' | 'Stary Mlyn') {

        const roomNameToNumberMap = {
            'Browar Miesczanski': '1',
            'Stary Mlyn': '2'
        }

        await this.rehearsalRoomElement.locator('button').click();
        await expect(this.page.getByRole('menu')).toBeVisible();

        if(roomName === 'Wszystkie') {
            await this.page.getByRole('menuitem', {name: 'Wszystkie'}).click();
        } else {
            await this.page.getByTestId(`form-room-${roomNameToNumberMap[roomName]}`).click();
        }
    }

    public async expectRehearsalRoomErrorMessageToBe(errorMessage: string) {
        await expect(this.rehearsalRoomElement).toContainText(errorMessage);
    }

    public get reservationTypeButton() {
        return this.page.locator('[id^="undefined-undefined-Typrezerwacji-"] button');
    }

    public async selectReservationType(typeName: 'Wybierz...' | 'Zespol' | 'Solo' | 'Nagrywka') {

        const typeNameToNumberMap = {
            'Zespol': '0',
            'Solo': '1',
            'Nagrywka': '2'
        }

        await this.reservationTypeButton.click();
        await expect(this.page.getByRole('menu')).toBeVisible();

        if(typeName === 'Wybierz...') {
            await this.page.getByRole('menuitem', {name: 'Wybierz...'}).click();
        } else {
           await this.page.getByTestId(this.reservationTypeIdSelector + `-${typeNameToNumberMap[typeName]}`).click();
        }
    }

    reservationTypeIdSelector = 'form-reservation-type';

    public async expectReservationTypeErrorMessageToBe(errorMessage: string) {
        await expect(this.page.getByTestId(this.reservationTypeIdSelector)).toContainText(errorMessage);
    }

    public get bandNameInput() {
        return this.page.getByTestId('form-band-name');
    }

    public async enterBandName(name: string) {
        await this.bandNameInput.fill(name);
    }

    public async expectBandNameErrorMessageToBe(errorMessage: string) {
        await expect(this.bandNameInput.locator('~ div').getByText(errorMessage)).toBeVisible();
    }

    public get phoneNumberInput() {
        return this.page.getByTestId('form-phone-number');
    }

    public async enterPhoneNumber(number: string) {
        // correct phone number starts at: 50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88
        await this.phoneNumberInput.fill(number);
    }

    public async expectPhoneNumErrorMessageToBe(errorMessage: string) {
        await expect(this.phoneNumberInput.locator('~ div').getByText(errorMessage)).toBeVisible();
    }

    public async generateRandomPhoneNumber() {

        const min = 1000000;
        const max = 9999999;

        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        return '50' + String(randomNum);
    }

    dateClass = this.page.locator('.form__input-date');

    public get startDateInput() {
        return this.page.getByTestId('form-start-date');
    }

    public async enterStartDate(day: string) {
        await this.startDateInput.click();
        await this.datePicker.selectDay(day);
    }

    public async expectStartDateErrorMessageToBe(errorMessage: string) {
        return expect(this.dateClass.first()).toContainText(errorMessage);
    }

    public get endDateInput() {
        return this.page.getByTestId('form-end-date');
    }

    public async enterEndDate(day: string) {
        await this.endDateInput.click();
        await this.datePicker.selectDay(day);
    }

    public async expectEndDateErrorMessageToBe(errorMessage: string) {
        await expect(this.endDateInput.locator('~ div').getByText(errorMessage)).toBeVisible();
    }

    public async enterReservationDate(startDay: string, endDay?: string) {
        await this.enterStartDate(startDay);
        await this.endDateInput.click();

        if (endDay) {
            await this.datePicker.selectDay(endDay);
        } else {
            await this.datePicker.selectDay(startDay);
        }
    }

    public get startTimeInput() {
        return this.page.getByTestId('form-start-time');
    }

    public async selectStartTime(hour: string) {
        await this.startTimeInput.click();
        await this.timePicker.selectTime(hour);
    }

    public get endTimeInput() {
        return this.page.getByTestId('form-end-time');
    }

    public async selectEndTime(hour: string) {
        await this.endTimeInput.click();
        await this.timePicker.selectTime(hour);
    }

    public async selectReservationTime(startHour: string, endHour: string) {
        await this.selectStartTime(startHour);
        await this.selectEndTime(endHour);
    }

    public async expectSelectedTimeToBe(startHour: string, endHour: string) {

        if(startHour.length === 1) {
            await expect(this.startTimeInput).toHaveValue(`0${startHour}:00`);
        }  else {
            await expect(this.startTimeInput).toHaveValue(`${startHour}:00`);
        }

        if(endHour.length === 1) {
            await expect(this.endTimeInput).toHaveValue(`0${endHour}:00`);
        } else {
            await expect(this.endTimeInput).toHaveValue(`${endHour}:00`);
        }
    }

    public get agreementCheckbox() {
        return this.page.getByTestId('accept-rules-checkbox');
    }

    public async selectAgreementCheckbox() {
        await this.agreementCheckbox.click();
    }

    public get submitWithOnlinePaymentButton() {
        return this.page.getByTestId('form-submit-online-payment');
    }

    public async submitWithOnlinePayment() {
        await this.submitWithOnlinePaymentButton.click();
    }

    public async getOnlineReservationPrice() {
        // needed to get the text with amount to pay. Without this, the amount info is not returned
        await this.page.waitForTimeout(200);
        const reservationPriceText = await this.submitWithOnlinePaymentButton.textContent();

        return reservationPriceText.substring(33, 35);
    }

    public get submitWithCashPaymentButton() {
        return this.page.getByTestId('form-submit');
    }

    public async submitWithCashPayment() {
        await this.submitWithCashPaymentButton.click();
    }

    public get successfulReservationAlert() {
        return this.page.getByTestId('successful-reservation');
    }

    public async closeSuccessfulReservationAlert() {
        await this.successfulReservationAlert.getByTestId('accept').click();
    }

    public async getSpecificDate(dayName: "yesterday" | "today" | "tomorrow" | "day after tomorrow") {

        const dayNameToNumberMap = {
            "yesterday": -1,
            "today": 0,
            "tomorrow": 1,
            "day after tomorrow": 2
        }

        const today = new Date();
        const newDate = new Date(today);

        newDate.setDate(today.getDate() + dayNameToNumberMap[dayName]);
        return String(newDate.getDate());
    }

    public async generateRandomHour() {
        return Math.floor(Math.random() * 22);
    }

    public async expectReservationToBeCreated(date: string, startHour: string, bandName: string) {

        const dateInRowSelector = this.page.locator(`.fc-row.fc-widget-header [data-date="${date}"]`);
        await expect(dateInRowSelector).toBeVisible();

        const dayWeekName = await dateInRowSelector.innerText();
        const dayWeekNameSubstring = dayWeekName.substring(0,3);

        const polWeekDaysToNumbMap = {
            'pon': '1',
            'wt ': '2',
            'śr ': '3',
            'czw': '4',
            'pt ': '5',
            'sob': '6',
            'ndz': '7'
        }

        const specificCalendarReservationElem = this.page.getByTestId(`reservation-entry-${polWeekDaysToNumbMap[dayWeekNameSubstring]}-${startHour}`);
        const previewOfCalendarReservation = specificCalendarReservationElem.getByText(bandName);

        await expect(previewOfCalendarReservation).not.toBeVisible();
        await expect(specificCalendarReservationElem).toBeVisible();
    }
}