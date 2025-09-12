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

    reservationTypeIdSelector = 'form-reservation-type';
    formInputFieldSelector = this.page.locator('.form__input-field');
    bandNameFieldSelector = this.page.getByTestId('form-band-name');
    phoneNumberFieldSelector = this.page.getByTestId('form-phone-number');
    startDateAndTimeFieldSelector = this.page.getByTestId('form-start-date');
    endDateAndTimeFieldSelector = this.page.getByTestId('form-end-date');

    public get reservationFormElement() {
        return this.page.locator('.reservation__form');
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
        return this.page.getByTestId(this.reservationTypeIdSelector).getByRole('combobox');
    }

    public async selectReservationType(typeName: reservationTypeNameType) {

        const typeNameToNumberMap = {
            'Solo': '1',
            'Nagrywka': '2',
            'Solo z talerzami': '3',
            'Zespół': '4',
        }

        await this.reservationTypeButton.click();
        await expect(this.page.getByRole('listbox')).toBeVisible();

        if (typeName === 'Wybierz...') {
            await this.page.getByRole('option').getByText('Wybierz...').click();
        } else {
            await this.page.getByTestId(this.reservationTypeIdSelector + `-${typeNameToNumberMap[typeName]}`).click();
        }
    }

    public async expectReservationTypeErrorMessageToBe(errorMessage: string) {
        await expect(this.page.getByTestId(this.reservationTypeIdSelector).first()).toContainText(errorMessage);
    }

    public get bandNameInput() {
        return this.bandNameFieldSelector.locator('input');
    }

    public async enterBandName(name: string) {
        await this.bandNameInput.fill(name);
    }

    public async expectBandNameErrorMessageToBe(errorMessage: string) {
        await expect(this.bandNameFieldSelector.first()).toContainText(errorMessage);
    }

    public get phoneNumberInput() {
        return this.phoneNumberFieldSelector.locator('input');
    }

    public async enterPhoneNumber(number: string) {
        // correct phone number starts at: 50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88
        await this.phoneNumberInput.fill(number);
    }

    public async expectPhoneNumErrorMessageToBe(errorMessage: string) {
        await expect(this.phoneNumberFieldSelector.first()).toContainText(errorMessage);
    }

    public async generateRandomPhoneNumber() {

        const validPhoneNumberPrefixes = [50, 51, 53, 57, 60, 66, 69, 72, 73, 78, 79, 88];
        const randomIndex = Math.floor(Math.random() * validPhoneNumberPrefixes.length);
        const randomBeginningValue = validPhoneNumberPrefixes[randomIndex];

        const min = 1000000;
        const max = 9999999;

        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        const randomNumStr = String(randomNum).padStart(7,"0");
        return randomBeginningValue + randomNumStr.substring(0,1) + ' ' + randomNumStr.substring(1,4) + ' ' + randomNumStr.substring(4,7);
    }

    public async getStartDateInputValue() {

        const day = await this.startDateAndTimeFieldSelector.locator('[aria-label="Day"]').textContent();
        const month = await this.startDateAndTimeFieldSelector.locator('[aria-label="Month"]').textContent();
        const year = await this.startDateAndTimeFieldSelector.locator('[aria-label="Year"]').textContent();

        return year + '-' + month + '-' + day;
    }

    public async clickToSelectStartDateAndTime() {
        await this.startDateAndTimeFieldSelector.locator('button').click();
    }

    public async enterStartDate(day: Date) {
        await this.clickToSelectStartDateAndTime();
        await this.dateAndTimePicker.selectDay(day);
        await this.dateAndTimePicker.accept();
    }

    public async expectStartDateErrorMessageToBe(errorMessage: string) {
        return expect(this.startDateAndTimeFieldSelector.locator('~ p')).toContainText(errorMessage);
    }

    public async clickToSelectEndDateAndTime() {
        await this.endDateAndTimeFieldSelector.locator('button').click();
    }

    public async enterEndDate(day: Date) {
        await this.clickToSelectEndDateAndTime();
        await this.dateAndTimePicker.selectDay(day);
        await this.dateAndTimePicker.accept();
    }

    public async expectEndDateErrorMessageToBe(errorMessage: string) {
        await expect(this.endDateAndTimeFieldSelector.locator('~ p')).toContainText(errorMessage);
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
        return this.formInputFieldSelector.locator('[type="checkbox"]');
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

        const getPrice = async () => {
            const text = await this.submitWithCashPaymentButton.textContent();
            return text.substring(38, 40);
        };

        await expect(async () => {
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
        await this.enterDatesAndTime(startDay, startHour, endHour, endDay);
        await this.selectAgreementCheckbox();
    }

    public async expectNewUserOnlinePaymentAlertToBe() {
        const message = 'Dla nowych użytkowników dostępna jest wyłącznie płatność online. Po pierwszej odbytej próbie pojawi się opcja płatności gotówką.';

        await expect(this.formInputFieldSelector.last()).toContainText(message);
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

    public async getNextHour() {

        const now = new Date();
        const currentHour = now.getHours();
        return currentHour + 1;
    }

    public async expectReservationToBeCreated(inputDate: string, startHour: number, bandName: string, successfulAlert = true, adminPanel = false) {

        if (successfulAlert) {
            // only appears when paying with cash
            await this.closeSuccessfulReservationAlert();
        }
        await this.calendar.expectReservationToBeVisible(inputDate, startHour, bandName, adminPanel);
    }
}