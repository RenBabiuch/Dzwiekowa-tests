import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";


let pages: ReturnType<typeof initialise>;
let generated: { phoneNum: string; startHour: number };
test.beforeEach(async ({page}) => {
    pages = initialise(page);

    generated = {
        phoneNum: await pages.reservationPage.generateRandomPhoneNumber(),
        startHour: await pages.reservationPage.generateRandomHour(),
    } as const;

    await page.goto('/');
});

const roomsName = {
    all: 'Wszystkie',
    num1: 'Browar Miesczanski',
    num2: 'Stary Mlyn',
} as const;

const reservationType = {
    none: 'Wybierz...',
    band: "Zespol",
    solo: 'Solo',
    records: 'Nagrywka',
} as const;

const successfulMessage = 'Rezerwacja zapisana pomyślnie. Na podany numer telefonu otrzymasz potwierdzenie, a zaraz przed próbą wyślemy kod do drzwi.';

test.describe('Cash reservation tests', async () => {

    test('Successful reservation with correct data', async () => {

        const reservation = {
            bandName: 'Chleb i Kawa',
            date: await pages.reservationPage.getSpecificDate("day after tomorrow"),
        } as const;

        const endHour = generated.startHour + 1;

        await test.step('Fill the form with correct data', async () => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num2);
            await pages.reservationPage.generateRandomHour();
            await pages.reservationPage.selectReservationType(reservationType.band);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(reservation.date);
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(endHour));
            await pages.reservationPage.expectSelectedTimeToBe(String(generated.startHour), String(endHour));
        });

        await test.step('Select the checkbox and send the form', async () => {
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitAndSelectCashPayment();
        });

        await test.step('After entering correct reservation code - the reservation should be created properly', async () => {
            await pages.bookingConfirmationPage.expectEnteredNumberToBeVisible(generated.phoneNum);
            await pages.bookingConfirmationPage.enterUserReservationCode();
            await pages.bookingConfirmationPage.confirmReservation();
            await expect(pages.reservationPage.successfulReservationAlert).toBeVisible();
            await expect(pages.reservationPage.successfulReservationAlert).toHaveText(successfulMessage);
        });
    });

    test('Unsuccessful reservation of the date from the past', async ({page}) => {

        const reservation = {
            bandName: 'Hope',
            date: await pages.reservationPage.getSpecificDate('yesterday'),
            endHour: generated.startHour + 2,
        } as const;

        const lateReservationErrorMessage = 'Próbę można zarezerwować z minimalnym wyprzedzeniem -60 minut';

        await test.step('Fill inputs with correct data', async () => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
            await page.pause();
            await pages.reservationPage.selectReservationType(reservationType.records);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
        });

        await test.step('After selecting date from the past, the error message should be visible', async () => {
            await pages.reservationPage.enterReservationDate(reservation.date);
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitAndSelectCashPayment();
            await pages.reservationPage.expectStartDateErrorMessageToBe(lateReservationErrorMessage);
        });
    });

    test('Unsuccessful reservation with an end-hour that is earlier than the start-hour', async () => {

        const bandName = 'heloł world';
        const date = await pages.reservationPage.getSpecificDate('tomorrow');
        const endHour = generated.startHour - 1;
        const endHourErrorMessage = 'Próba nie może się skończyć przed rozpoczęciem :) .';

        await test.step('Fill the inputs with correct data', async () => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
            await pages.reservationPage.selectReservationType(reservationType.band);
            await pages.reservationPage.enterBandName(bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(date);
        });

        await test.step('After entering an end-hour that is earlier than the start-hour, error message should be visible', async () => {
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(endHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitAndSelectOnlinePayment();
            await pages.reservationPage.expectEndDateErrorMessageToBe(endHourErrorMessage);
        });
    });

    test('Unsuccessful reservation when start-hour and end-hour are the same', async () => {

        const bandName = 'Kwiaty i krzewy';
        const date = await pages.reservationPage.getSpecificDate('tomorrow');
        const hourErrorMessage = 'Próba nie może się skończyć przed rozpoczęciem :) .';

        await test.step('Fill the inputs with correct data', async() => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
            await pages.reservationPage.selectReservationType(reservationType.records);
            await pages.reservationPage.enterBandName(bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(date);
        });

        await test.step('After entering the same start and end-hour, error message should be visible', async() => {
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(generated.startHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitAndSelectCashPayment();
            await pages.reservationPage.expectEndDateErrorMessageToBe(hourErrorMessage);
        });
    });
});