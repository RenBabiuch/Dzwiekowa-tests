import {expect, Page} from "@playwright/test";
import {Calendar} from "../components/calendar";
import {DateAndTimePicker} from "../components/date-and-time-picker";

    type roomNameType = 'Wszystkie' | 'Browar Miesczanski' | 'Stary Mlyn';
    type reservationTypeNameType = 'Wybierz...' | 'Zespół' | 'Solo' | 'Nagrywka';
    type dayNameType = 'yesterday' | 'today' | 'tomorrow' | 'day after tomorrow';

    export class ReservationPagePO {
    constructor(private page: Page) {
    }

    calendar = new Calendar(this.page);
    dateAndTimePicker = new DateAndTimePicker(this.page);

    public get reservationFormElement() {
        return this.page.locator('.reservation-form-container');
    }

    public get rehearsalRoomElement() {
        return this.page.getByTestId('form-room').first();
    }

    public async selectRehearsalRoom(roomName: roomNameType) {

        const roomNameToNumberMap = {
            'Browar Miesczanski': '1',
            'Stary Mlyn': '2'
        }

        await this.rehearsalRoomElement.click();
        await expect(this.page.getByRole('listbox')).toBeVisible();

        if (roomName === 'Wszystkie') {
            await this.page.getByRole('option').getByText('Wszystkie', {exact: true}).click();
        } else {
            await this.page.getByTestId(`form-room-${roomNameToNumberMap[roomName]}`).click();
        }
    }

    public async expectRehearsalRoomErrorMessageToBe(errorMessage: string) {
        await expect(this.rehearsalRoomElement).toContainText(errorMessage);
    }

    public get reservationTypeButton() {
        return this.page.getByTestId('form-reservation-type').first();
    }

    public async selectReservationType(typeName: reservationTypeNameType) {

        const typeNameToNumberMap = {
            'Solo': '1',
            'Nagrywka': '2',
            // todo - dodać: solo z talerzami
            'Zespół': '5',
        }

        await this.reservationTypeButton.click();
        await expect(this.page.getByRole('listbox')).toBeVisible();

        if (typeName === 'Wybierz...') {
            await this.page.getByRole('option').getByText('Wybierz...').click();
        } else {
            await this.page.getByTestId(this.reservationTypeIdSelector + `-${typeNameToNumberMap[typeName]}`).click();
        }
    }

    reservationTypeIdSelector = 'form-reservation-type';

    public async expectReservationTypeErrorMessageToBe(errorMessage: string) {
        await expect(this.page.getByTestId(this.reservationTypeIdSelector)).toContainText(errorMessage);
    }

    public get bandNameInput() {
        return this.page.getByTestId('form-band-name').locator('input');
    }

    public async enterBandName(name: string) {
        await this.bandNameInput.fill(name);
    }

    public async expectBandNameErrorMessageToBe(errorMessage: string) {
        await expect(this.bandNameInput.locator('~ div').getByText(errorMessage)).toBeVisible();
    }

    public get phoneNumberInput() {
        return this.page.getByTestId('form-phone-number').locator('input');
    }

    public async enterPhoneNumber(number: string) {
        // correct phone number starts at: 50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88
        await this.phoneNumberInput.fill(number);
    }

    public async expectPhoneNumErrorMessageToBe(errorMessage: string) {
        await expect(this.phoneNumberInput.locator('~ div').getByText(errorMessage)).toBeVisible();
    }

    public async generateRandomPhoneNumber() {

        const validPhoneNumberPrefixes = [50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88];
        const randomIndex = Math.floor(Math.random() * validPhoneNumberPrefixes.length);
        const randomBeginningValue = validPhoneNumberPrefixes[randomIndex];

        const min = 1000000;
        const max = 9999999;

        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomBeginningValue + String(randomNum);
    }

    dateClass = this.page.locator('.form__input-date');
    startDateAndTimeSelector = this.page.getByTestId('form-start-date');

    public async getStartDateValue() {

        const day = await this.startDateAndTimeSelector.locator('[aria-label="Day"]').textContent();
        const month = await this.startDateAndTimeSelector.locator('[aria-label="Month"]').textContent();
        const year = await this.startDateAndTimeSelector.locator('[aria-label="Year"]').textContent();

        return year + '-' + month + '-' + day;
    }

    public async clickToSelectStartDateAndTime() {
        await this.startDateAndTimeSelector.locator('button').click();
    }

    public async enterStartDate(day: Date) {
        await this.clickToSelectStartDateAndTime();
        await this.dateAndTimePicker.selectDay(day);
        await this.dateAndTimePicker.accept();
    }

    public async expectStartDateErrorMessageToBe(errorMessage: string) {
        return expect(this.dateClass.first()).toContainText(errorMessage);
    }

    endDateAndTimeSelector = this.page.getByTestId('form-end-date');

    public async clickToSelectEndDateAndTime() {
        await this.endDateAndTimeSelector.locator('button').click();
    }

    public async enterEndDate(day: Date) {
        await this.clickToSelectEndDateAndTime();
        await this.dateAndTimePicker.selectDay(day);
        await this.dateAndTimePicker.accept();
    }

    public async expectEndDateErrorMessageToBe(errorMessage: string) {
        await expect(this.endDateAndTimeSelector.locator('~ div').getByText(errorMessage)).toBeVisible();
    }

    public async enterReservationDates(startDay: Date, endDay?: Date) {
        // todo - delete this method
        await this.enterStartDate(startDay);
        await this.clickToSelectEndDateAndTime();

        if (endDay) {
            await this.dateAndTimePicker.selectDay(endDay);
        } else {
            await this.dateAndTimePicker.selectDay(startDay);
            await this.dateAndTimePicker.accept();
        }
    }

    public async enterStartTime(hour: number) {
        await this.clickToSelectStartDateAndTime();
        await this.dateAndTimePicker.selectTime(hour);
        await this.dateAndTimePicker.accept();
    }

    public async enterEndTime(hour: number) {
        await this.clickToSelectEndDateAndTime();
        await this.dateAndTimePicker.selectTime(hour);
        await this.dateAndTimePicker.accept();
    }

    public async enterReservationTime(startHour: number, endHour: number) {
        // delete this method
        await this.enterStartTime(startHour);
        await this.enterEndTime(endHour);
    }

    public async enterDatesAndTime(startDay: Date, startHour: number, endHour: number, endDay?: Date) {
        await this.clickToSelectStartDateAndTime();
        await this.dateAndTimePicker.selectAndApproveDayAndTime(startDay, startHour);
        await this.clickToSelectEndDateAndTime();

        if (endDay) {
            await this.dateAndTimePicker.selectAndApproveDayAndTime(endDay, endHour);
        } else {
            await this.dateAndTimePicker.selectAndApproveDayAndTime(startDay, endHour);
        }
    }

    public async expectSelectedTimeToBe(startHour: number, endHour: number) {

        const reservationHourSelector = this.page.locator('.MuiPickersSectionList-section').locator('[aria-label="Hours"]');

        if (String(startHour).length === 1) {
            await expect(reservationHourSelector.first()).toHaveText(`0${String(startHour)}`)
        } else {
            await expect(reservationHourSelector.first()).toHaveText(String(startHour));
        }

        if (String(endHour).length === 1) {
            await expect(reservationHourSelector.last()).toHaveText(`0${String(endHour)}`)
        } else {
            await expect(reservationHourSelector.last()).toHaveText(String(endHour));
        }
    }

    public get agreementCheckbox() {
        return this.page.locator('.form__input-field').locator('[type="checkbox"]');
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

        const getPrice = async () => {
            const text = await this.submitWithOnlinePaymentButton.textContent();
            return text.substring(33, 35);
        }

        await expect(async () => {
            const currentPrice = await getPrice();
            await expect(currentPrice.length).toBeGreaterThan(0);
        }).toPass();

        return getPrice();
    }

    public async getCashReservationPrice() {

        const getPrice = async() => {
          const text = await this.submitWithCashPaymentButton.textContent();
          return text.substring(38, 40);
        };

        await expect(async() => {
            const currentPrice = await getPrice();
            await expect(currentPrice.length).toBeGreaterThan(0);
        }).toPass();

        return getPrice();
    }

    public get submitWithCashPaymentButton() {
        return this.page.getByTestId('form-submit');
    }

    public async submitWithCashPayment() {
        await this.submitWithCashPaymentButton.click();
    }

    public async fillTheReservationForm(room: roomNameType, type: reservationTypeNameType, bandName: string, phoneNum: string, startHour: number, endHour: number, startDay: Date, endDay?: Date) {
        await this.selectRehearsalRoom(room);
        await this.selectReservationType(type);
        await this.enterBandName(bandName);
        await this.enterPhoneNumber(phoneNum);
        await this.enterReservationDates(startDay, endDay);
        await this.enterReservationTime(startHour, endHour);
        await this.selectAgreementCheckbox();
    }

    public get successfulReservationAlert() {
        return this.page.getByTestId('successful-reservation');
    }

    public async closeSuccessfulReservationAlert() {
        await this.successfulReservationAlert.getByTestId('accept').click();
    }

    public async getSpecificDate(dayName: dayNameType) {

        const dayNameToNumberMap = {
            "yesterday": -1,
            "today": 0,
            "tomorrow": 1,
            "day after tomorrow": 2
        }

        const finalDate = new Date();
        finalDate.setDate(finalDate.getDate() + dayNameToNumberMap[dayName]);
        return finalDate;
    }

    public async generateRandomHour() {
        return Math.floor(Math.random() * 22);
    }

    public async expectReservationToBeCreated(date: string, startHour: number, bandName: string, successfulAlert = true, adminPanel = false) {

        if(successfulAlert) {
         await this.closeSuccessfulReservationAlert();
        }
        await this.calendar.expectReservationToBeVisible(date, startHour, bandName, adminPanel);
    }
}