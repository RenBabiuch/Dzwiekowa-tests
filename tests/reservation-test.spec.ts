import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";


let pages: ReturnType<typeof initialise>;
let generated: { phoneNum: string; startHour: number };
test.beforeEach(async ({page}) => {
    pages = initialise(page);

    generated = {
        phoneNum: await pages.reservationPage.reservationForm.generateRandomPhoneNumber(),
        startHour: await pages.reservationPage.reservationForm.generateRandomHour(),
    } as const;

    await page.goto('');
});

const roomsName = {
    all: 'Wszystkie',
    num1: 'Browar Miesczanski',
    num2: 'Stary Mlyn',
} as const;

const reservationType = {
    none: 'Wybierz...',
    band: "Zespół",
    solo: 'Solo',
    records: 'Nagrywka',
} as const;

const successfulMessage = 'Rezerwacja zapisana pomyślnie. Na podany numer telefonu otrzymasz potwierdzenie, a zaraz przed próbą wyślemy kod do drzwi.';
const emptyFieldErrorMessage = 'Pole jest wymagane';

test.describe('Reservation tests', async () => {

    test('Successful first online-reservation for new users', async () => {

        const reservation = {
            bandName: 'Chleb i Kawa',
            date: await pages.reservationPage.reservationForm.getSpecificDate("day after tomorrow"),
            endHour: generated.startHour + 1,
        } as const;

        await test.step('After entering new phone number, cash payment button should disappear and online payment alert should appear', async () => {
            await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.num2);
            await pages.reservationPage.reservationForm.selectReservationType(reservationType.band);
            await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
            await expect(pages.reservationPage.reservationForm.submitWithCashPaymentButton).toBeVisible();
            await pages.reservationPage.reservationForm.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
            await pages.reservationPage.reservationForm.expectSelectedTimeToBe(generated.startHour, reservation.endHour);
            await expect(pages.reservationPage.reservationForm.submitWithCashPaymentButton).not.toBeVisible();
            await pages.reservationPage.expectNewUserOnlinePaymentAlertToBe();
        });

        const reservationDate = await pages.reservationPage.reservationForm.getStartDateInputValue();

        await test.step('Select the checkbox and send the form', async () => {
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithOnlinePayment();
        });

        await test.step('Enter correct data and proceed to payment', async () => {
            await pages.phoneConfirmationPage.expectEnteredNumberToBeVisible(generated.phoneNum);
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
            await pages.prePaymentPage.enterEmailAddress();
            await pages.prePaymentPage.goToPaymentMethod();
        });

        await test.step('After making the transfer, the reservation should be visible in the calendar', async () => {
            await pages.paymentMethodMenu.goToTransferPayment();
            await pages.transferPage.selectIngBankTransfer();
            await pages.bankPage.goToPay();
            await pages.reservationPage.reservationForm.expectReservationToBeCreated(reservationDate, generated.startHour, reservation.bandName, false);
        });
    });
});

test('Unsuccessful reservation of the date from the past', async () => {

    const reservation = {
        bandName: 'Hope',
        date: await pages.reservationPage.reservationForm.getSpecificDate('yesterday'),
        endHour: generated.startHour + 2,
    } as const;

    const lateReservationErrorMessage = 'Próbę można zarezerwować z minimalnym wyprzedzeniem 0 minut';

    await test.step('Fill inputs with correct data', async () => {
        await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.num1);
        await pages.reservationPage.reservationForm.selectReservationType(reservationType.records);
        await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
        await pages.reservationPage.reservationForm.enterPhoneNumber(generated.phoneNum);
    });

    await test.step('After selecting date from the past, the error message should be visible', async () => {
        await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.reservationPage.reservationForm.expectStartDateErrorMessageToBe(lateReservationErrorMessage);
    });
});

test('Unsuccessful reservation with an end-hour that is earlier than the start-hour', async () => {

    const reservation = {
        bandName: 'heloł world',
        date: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
        endHour: generated.startHour - 1,
    } as const;

    const endHourErrorMessage = 'Próba nie może się skończyć przed rozpoczęciem :) .';

    await test.step('Fill the inputs with correct data', async () => {
        await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.num1);
        await pages.reservationPage.reservationForm.selectReservationType(reservationType.band);
        await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
        await pages.reservationPage.reservationForm.enterPhoneNumber(generated.phoneNum);
    });

    await test.step('After entering an end-hour that is earlier than the start-hour, error message should be visible', async () => {
        await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.reservationPage.reservationForm.expectEndDateErrorMessageToBe(endHourErrorMessage);
    });
});

test('Unsuccessful reservation when start-hour and end-hour are the same', async () => {

    const reservation = {
        bandName: 'Kwiaty i krzewy',
        date: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
        endHour: generated.startHour,
    } as const;

    const hourErrorMessage = 'Próba nie może się skończyć przed rozpoczęciem :) .';

    await test.step('Fill the inputs with correct data', async () => {
        await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.num1);
        await pages.reservationPage.reservationForm.selectReservationType(reservationType.records);
        await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
        await pages.reservationPage.reservationForm.enterPhoneNumber(generated.phoneNum);
    });

    await test.step('After entering the same start and end-hour, error message should be visible', async () => {
        await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.reservationPage.reservationForm.expectEndDateErrorMessageToBe(hourErrorMessage);
    });
});

test('Unsuccessful creating a reservation for an already booked date', async () => {

    const reservation = {
        bandName1: 'Band Uno',
        bandName2: 'Band Los_Dos',
        date: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 2,
    } as const;

    let reservationDate: string;
    const roomOccupancyErrorMessage = 'Czas rezerwacji pokrywa się z innymi wpisami.';

    await test.step('Book a rehear-room for the first band', async () => {
        await pages.reservationPage.fillTheFormAndCheckCheckbox(roomsName.num2, reservationType.band, reservation.bandName1, generated.phoneNum, generated.startHour, reservation.endHour, reservation.date);
        await pages.reservationPage.submitWithOnlinePayment();

        reservationDate = await pages.reservationPage.reservationForm.getStartDateInputValue();

        await pages.phoneConfirmationPage.enterUserReservationCode();
        await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
        await pages.prePaymentPage.enterEmailAddress();
        await pages.prePaymentPage.goToPaymentMethod();
        await pages.paymentMethodMenu.goToTransferPayment();
        await pages.transferPage.selectIngBankTransfer();
        await pages.bankPage.goToPay();
        await pages.reservationPage.reservationForm.expectReservationToBeCreated(reservationDate, generated.startHour, reservation.bandName1, false);
    });

    await test.step('After creating a reservation for the same - already booked - date, an error message should appear', async () => {
        await pages.reservationPage.fillTheFormAndCheckCheckbox(roomsName.num2, reservationType.band, reservation.bandName2, generated.phoneNum, generated.startHour, reservation.endHour, reservation.date);
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.reservationPage.reservationForm.expectEndDateErrorMessageToBe(roomOccupancyErrorMessage);
    });
});

test('Unsuccessful reservation when no room is selected', async () => {

    const reservation = {
        bandName: 'stokrotka',
        date: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 2,
    } as const;

    const reservationTypeErrorMessage = 'Pole type jest wymagane.';

    await test.step('When no specific room is selected, the reservation type selection should be disabled', async () => {
        await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.all);
        await expect(pages.reservationPage.reservationForm.reservationTypeButton).toBeDisabled();
    });

    await test.step('Fill the rest of the form with correct data', async () => {
        await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
        await pages.reservationPage.reservationForm.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.reservationForm.submitWithCashPayment();
    });

    await test.step('Unsuccessful reservation - both validation messages should be visible', async () => {
        await pages.reservationPage.reservationForm.expectRehearsalRoomErrorMessageToBe(emptyFieldErrorMessage);
        await pages.reservationPage.reservationForm.expectReservationTypeErrorMessageToBe(reservationTypeErrorMessage);
    });
});

test('Unsuccessful reservation when reservation type is not selected', async () => {

    const reservation = {
        bandName: 'Fiołki',
        date: await pages.reservationPage.reservationForm.getSpecificDate('day after tomorrow'),
        endHour: generated.startHour + 3,
    } as const;

    const reservationTypeErrorMessage = 'Pole type jest wymagane.';

    await test.step('Fill the form - except the reservation type field - with correct data', async () => {
        await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.num1);
        await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
        await pages.reservationPage.reservationForm.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
    });

    await test.step('Unsuccessful reservation - the reservation type validation message should be visible', async () => {
        await pages.reservationPage.reservationForm.expectReservationTypeErrorMessageToBe(reservationTypeErrorMessage);
    });
});

test('Unsuccessful reservation when band name is not entered', async () => {

    const reservation = {
        date: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 3,
    } as const;

    await test.step('Fill the form with correct data - ensure band name input is empty', async () => {
        await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.num2);
        await pages.reservationPage.reservationForm.selectReservationType(reservationType.records);
        await expect(pages.reservationPage.reservationForm.bandNameInput).toBeEmpty();
        await pages.reservationPage.reservationForm.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
    });

    await test.step('Unsuccessful reservation - band name validation message should be visible', async () => {
        await pages.reservationPage.reservationForm.expectBandNameErrorMessageToBe(emptyFieldErrorMessage);
    });
});

test('Unsuccessful reservation when no phone number is entered', async () => {
    const reservation = {
        bandName: 'Wiewióry',
        date: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 1,
    } as const;

    await test.step('Fill the form with correct data - ensure phone number field is empty', async () => {
        await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.num2);
        await pages.reservationPage.reservationForm.selectReservationType(reservationType.records);
        await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
        await expect(pages.reservationPage.reservationForm.phoneNumberInput).toBeEmpty();
        await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.reservationForm.submitWithCashPayment();
    });

    await test.step('Unsuccessful reservation - phone num validation message should be visible', async () => {
        await pages.reservationPage.reservationForm.expectPhoneNumErrorMessageToBe(emptyFieldErrorMessage);
    });
});

test('Unsuccessful reservation when no end date is entered', async () => {

    const reservation = {
        bandName: 'E-agles',
        date: await pages.reservationPage.reservationForm.getSpecificDate('day after tomorrow'),
        endHour: generated.startHour + 2,
    } as const;

    await test.step('Fill the form with correct data - ensure end date is not selected', async () => {
        await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.num1);
        await pages.reservationPage.reservationForm.selectReservationType(reservationType.band);
        await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
        await pages.reservationPage.reservationForm.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.reservationForm.enterStartDate(reservation.date);
        await pages.reservationPage.reservationForm.enterStartTime(generated.startHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.reservationForm.submitWithCashPayment();
    });

    await test.step('Unsuccessful reservation - date validation message should be visible', async () => {
        await pages.reservationPage.reservationForm.expectEndDateErrorMessageToBe(emptyFieldErrorMessage);
    });
});

test('Unsuccessful reservation when agreement checkbox is not checked', async () => {

    const reservation = {
        bandName: 'Believers',
        date: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 2,
    } as const;

    await test.step('Fill the form with correct data', async () => {
        await pages.reservationPage.reservationForm.selectRehearsalRoom(roomsName.num2);
        await pages.reservationPage.reservationForm.selectReservationType(reservationType.records);
        await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
        await pages.reservationPage.reservationForm.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
    });

    await test.step('After sending the form without agreement checked, the form should still be visible with the entered data', async () => {
        await expect(pages.reservationPage.agreementCheckbox).not.toBeChecked();
        await pages.reservationPage.reservationForm.submitWithCashPayment();
        await expect(pages.reservationPage.reservationForm.reservationFormElement).toBeInViewport();
        await expect(pages.reservationPage.reservationForm.bandNameInput).toHaveValue(reservation.bandName);
    });
});