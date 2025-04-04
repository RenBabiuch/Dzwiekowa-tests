import {expect, Page} from "@playwright/test";
import {Calendar} from "../components/calendar";
import {DatePicker} from "../components/date-picker";
import {TimePicker} from "../components/time-picker";

    type roomNameType = 'Wszystkie' | 'Browar Miesczanski' | 'Stary Mlyn';
    type reservationTypeNameType = 'Wybierz...' | 'Zespol' | 'Solo' | 'Nagrywka';
    type dayNameType = 'yesterday' | 'today' | 'tomorrow' | 'day after tomorrow';

    export class ReservationPagePO {
    constructor(private page: Page) {
    }

    calendar = new Calendar(this.page);
    datePicker = new DatePicker(this.page);
    timePicker = new TimePicker(this.page);

    public get reservationFormElement() {
        return this.page.locator('.reservation-form-container');
    }

    public get rehearsalRoomElement() {
        return this.page.getByTestId('form-room');
    }

    public async selectRehearsalRoom(roomName: roomNameType) {

        const roomNameToNumberMap = {
            'Browar Miesczanski': '1',
            'Stary Mlyn': '2'
        }

        await this.rehearsalRoomElement.locator('button').click();
        await expect(this.page.getByRole('menu')).toBeVisible();

        if (roomName === 'Wszystkie') {
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

    public async selectReservationType(typeName: reservationTypeNameType) {

        const typeNameToNumberMap = {
            'Zespol': '0',
            'Solo': '1',
            'Nagrywka': '2'
        }

        await this.reservationTypeButton.click();
        await expect(this.page.getByRole('menu')).toBeVisible();

        if (typeName === 'Wybierz...') {
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

        const validPhoneNumberPrefixes = [50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88];
        const randomIndex = Math.floor(Math.random() * validPhoneNumberPrefixes.length);
        const randomBeginningValue = validPhoneNumberPrefixes[randomIndex];

        const min = 1000000;
        const max = 9999999;

        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomBeginningValue + String(randomNum);
    }

    dateClass = this.page.locator('.form__input-date');

    public get startDateInput() {
        return this.page.getByTestId('form-start-date');
    }

    public get startDateInputValue() {
        return this.startDateInput.getAttribute('value');
    }

    public async enterStartDate(day: Date) {
        await this.startDateInput.click();
        await this.datePicker.selectDay(day);
    }

    public async expectStartDateErrorMessageToBe(errorMessage: string) {
        return expect(this.dateClass.first()).toContainText(errorMessage);
    }

    public get endDateInput() {
        return this.page.getByTestId('form-end-date');
    }

    public async enterEndDate(day: Date) {
        await this.endDateInput.click();
        await this.datePicker.selectDay(day);
    }

    public async expectEndDateErrorMessageToBe(errorMessage: string) {
        await expect(this.endDateInput.locator('~ div').getByText(errorMessage)).toBeVisible();
    }

    public async enterReservationDate(startDay: Date, endDay?: Date) {
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

    public async selectStartTime(hour: number) {
        await this.startTimeInput.click();
        await this.timePicker.selectTime(hour);
    }

    public get endTimeInput() {
        return this.page.getByTestId('form-end-time');
    }

    public async selectEndTime(hour: number) {
        await this.endTimeInput.click();
        await this.timePicker.selectTime(hour);
    }

    public async selectReservationTime(startHour: number, endHour: number) {
        await this.selectStartTime(startHour);
        await this.selectEndTime(endHour);
    }

    public async expectSelectedTimeToBe(startHour: number, endHour: number) {

        if (String(startHour).length === 1) {
            await expect(this.startTimeInput).toHaveValue(`0${String(startHour)}:00`);
        } else {
            await expect(this.startTimeInput).toHaveValue(`${String(startHour)}:00`);
        }

        if (String(endHour).length === 1) {
            await expect(this.endTimeInput).toHaveValue(`0${String(endHour)}:00`);
        } else {
            await expect(this.endTimeInput).toHaveValue(`${String(endHour)}:00`);
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
        await this.enterReservationDate(startDay, endDay);
        await this.selectReservationTime(startHour, endHour);
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