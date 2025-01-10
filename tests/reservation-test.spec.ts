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
const emptyFieldErrorMessage = 'Pole jest wymagane';

test.describe('Cash reservation tests', async () => {

    test('Successful reservation with correct data', async () => {

        const reservation = {
            bandName: 'Chleb i Kawa',
            date: await pages.reservationPage.getSpecificDate("day after tomorrow"),
            endHour: generated.startHour + 1,
        } as const;

        await test.step('Fill the form with correct data', async () => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num2);
            await pages.reservationPage.generateRandomHour();
            await pages.reservationPage.selectReservationType(reservationType.band);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(reservation.date);
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour));
            await pages.reservationPage.expectSelectedTimeToBe(String(generated.startHour), String(reservation.endHour));
        });

        const reservationDate = await pages.reservationPage.startDateInput.getAttribute('value');

        await test.step('Select the checkbox and send the form', async () => {
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithCashPayment();
        });

        await test.step('After entering correct reservation code - the reservation should be created properly', async () => {
            await pages.phoneConfirmationPage.expectEnteredNumberToBeVisible(generated.phoneNum);
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmReservation();
            await expect(pages.reservationPage.successfulReservationAlert).toBeVisible();
            await expect(pages.reservationPage.successfulReservationAlert).toHaveText(successfulMessage);
            await pages.reservationPage.closeSuccessfulReservationAlert();
            await pages.reservationPage.expectReservationToBeCreated(reservationDate, String(generated.startHour), reservation.bandName);
        });
    });

    test('Unsuccessful reservation of the date from the past', async () => {

        const reservation = {
            bandName: 'Hope',
            date: await pages.reservationPage.getSpecificDate('yesterday'),
            endHour: generated.startHour + 2,
        } as const;

        const lateReservationErrorMessage = 'Próbę można zarezerwować z minimalnym wyprzedzeniem -60 minut';

        await test.step('Fill inputs with correct data', async () => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
            await pages.reservationPage.selectReservationType(reservationType.records);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
        });

        await test.step('After selecting date from the past, the error message should be visible', async () => {
            await pages.reservationPage.enterReservationDate(reservation.date);
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithCashPayment();
            await pages.reservationPage.expectStartDateErrorMessageToBe(lateReservationErrorMessage);
        });
    });

    test('Unsuccessful reservation with an end-hour that is earlier than the start-hour', async () => {

        const reservation = {
            bandName: 'heloł world',
            date: await pages.reservationPage.getSpecificDate('tomorrow'),
            endHour: generated.startHour - 1,
        } as const;

        const endHourErrorMessage = 'Próba nie może się skończyć przed rozpoczęciem :) .';

        await test.step('Fill the inputs with correct data', async () => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
            await pages.reservationPage.selectReservationType(reservationType.band);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(reservation.date);
        });

        await test.step('After entering an end-hour that is earlier than the start-hour, error message should be visible', async () => {
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithOnlinePayment();
            await pages.reservationPage.expectEndDateErrorMessageToBe(endHourErrorMessage);
        });
    });

    test('Unsuccessful reservation when start-hour and end-hour are the same', async () => {

        const reservation = {
            bandName: 'Kwiaty i krzewy',
            date: await pages.reservationPage.getSpecificDate('tomorrow'),
            endHour: generated.startHour,
        } as const;

        const hourErrorMessage = 'Próba nie może się skończyć przed rozpoczęciem :) .';

        await test.step('Fill the inputs with correct data', async() => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
            await pages.reservationPage.selectReservationType(reservationType.records);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(reservation.date);
        });

        await test.step('After entering the same start and end-hour, error message should be visible', async() => {
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithCashPayment();
            await pages.reservationPage.expectEndDateErrorMessageToBe(hourErrorMessage);
        });
    });

    test('Unsuccessful reservation when no room is selected', async() => {

        const reservation = {
            bandName: 'stokrotka',
            date: await pages.reservationPage.getSpecificDate('tomorrow'),
            endHour: generated.startHour + 2,
        } as const;

        const reservationTypeErrorMessage = 'Pole type jest wymagane.';

        await test.step('When no specific room is selected, the reservation type selection should be disabled', async() => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.all);
            await expect(pages.reservationPage.reservationTypeButton).toBeDisabled();
        });

        await test.step('Fill the rest of the form with correct data', async() => {
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(reservation.date);
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithCashPayment();
        });

        await test.step('Unsuccessful reservation - both validation messages should be visible', async() => {
            await pages.reservationPage.expectRehearsalRoomErrorMessageToBe(emptyFieldErrorMessage);
            await pages.reservationPage.expectReservationTypeErrorMessageToBe(reservationTypeErrorMessage);
        });
    });

    test('Unsuccessful reservation when reservation type is not selected', async() => {

        const reservation = {
            bandName: 'Fiołki',
            date: await pages.reservationPage.getSpecificDate('day after tomorrow'),
            endHour: generated.startHour + 3,
        } as const;

        const reservationTypeErrorMessage = 'Pole type jest wymagane.';

        await test.step('Fill the form - except the reservation type field - with correct data', async() => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(reservation.date);
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour))
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithOnlinePayment();
        });

        await test.step('Unsuccessful reservation - the reservation type validation message should be visible', async() => {
            await pages.reservationPage.expectReservationTypeErrorMessageToBe(reservationTypeErrorMessage);
        });
    });

    test('Unsuccessful reservation when band name is not entered', async() => {

        const reservation = {
            date: await pages.reservationPage.getSpecificDate('tomorrow'),
            endHour: generated.startHour + 3,
        } as const;

        await test.step('Fill the form with correct data - ensure band name input is empty', async() => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num2);
            await pages.reservationPage.selectReservationType(reservationType.records);
            await expect(pages.reservationPage.bandNameInput).toBeEmpty();
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(reservation.date);
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithCashPayment();
        });

        await test.step('Unsuccessful reservation - band name validation message should be visible', async() => {
            await pages.reservationPage.expectBandNameErrorMessageToBe(emptyFieldErrorMessage);
        });
    });

    test('Unsuccessful reservation when no phone number is entered', async() => {

        const reservation = {
            bandName: 'Wiewióry',
            date: await pages.reservationPage.getSpecificDate('tomorrow'),
            endHour: generated.startHour + 1,
        } as const;

        await test.step('Fill the form with correct data - ensure phone number field is empty', async() => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num2);
            await pages.reservationPage.selectReservationType(reservationType.records);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await expect(pages.reservationPage.phoneNumberInput).toBeEmpty();
            await pages.reservationPage.enterReservationDate(reservation.date);
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithCashPayment();
        });

        await test.step('Unsuccessful reservation - phone num validation message should be visible', async() => {
            await pages.reservationPage.expectPhoneNumErrorMessageToBe(emptyFieldErrorMessage);
        });
    });

    test('Unsuccessful reservation when no end date is entered', async() => {

        const reservation = {
            bandName: 'E-agles',
            date: await pages.reservationPage.getSpecificDate('day after tomorrow'),
            endHour: generated.startHour + 2,
        } as const;

        await test.step('Fill the form with correct data - ensure end date is not selected', async() => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
            await pages.reservationPage.selectReservationType(reservationType.band);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterStartDate(reservation.date);
            await expect(pages.reservationPage.endDateInput).toBeEmpty();
            await pages.reservationPage.selectStartTime(String(generated.startHour));
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithCashPayment();
        });

        await test.step('Unsuccessful reservation - date validation message should be visible', async() => {
            await pages.reservationPage.expectEndDateErrorMessageToBe(emptyFieldErrorMessage);
        });
    });

    test('Unsuccessful reservation when agreement checkbox is not checked', async() => {

        const reservation = {
            bandName: 'Believers',
            date: await pages.reservationPage.getSpecificDate('tomorrow'),
            endHour: generated.startHour + 2,
        } as const;

        await test.step('Fill the form with correct data', async() => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num2);
            await pages.reservationPage.selectReservationType(reservationType.records);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterReservationDate(reservation.date);
            await pages.reservationPage.selectReservationTime(String(generated.startHour), String(reservation.endHour));
        });

        await test.step('After sending the form without agreement checked, the form should still be visible with the entered data', async() => {
            await expect(pages.reservationPage.agreementCheckbox).not.toBeChecked();
            await pages.reservationPage.submitWithCashPayment();
            await expect(pages.reservationPage.reservationFormElement).toBeInViewport();
            await expect(pages.reservationPage.bandNameInput).toHaveValue(reservation.bandName);
        });
    });
});
