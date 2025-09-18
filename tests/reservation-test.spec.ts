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

const adminPassword = '12345';

const successfulMessage = 'Rezerwacja zapisana pomyślnie. Na podany numer telefonu otrzymasz potwierdzenie, a zaraz przed próbą wyślemy kod do drzwi.';
const emptyFieldErrorMessage = 'Pole jest wymagane';

test.describe('Reservation tests', async () => {

    test('Successful first online-reservation for new users', async () => {

        const reservation = {
            bandName: 'Chleb i Kawa',
            date: await pages.reservationPage.getSpecificDate("day after tomorrow"),
            endHour: generated.startHour + 1,
            email: 'songs999@karaoke.pl',
        } as const;

        await test.step('After entering new phone number, cash payment button should disappear and online payment alert should appear', async () => {
            await pages.reservationPage.selectRehearsalRoom(roomsName.num2);
            await pages.reservationPage.selectReservationType(reservationType.band);
            await pages.reservationPage.enterBandName(reservation.bandName);
            await expect(pages.reservationPage.submitWithCashPaymentButton).toBeVisible();
            await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
            await pages.reservationPage.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
            await pages.reservationPage.expectSelectedTimeToBe(generated.startHour, reservation.endHour);
            await expect(pages.reservationPage.submitWithCashPaymentButton).not.toBeVisible();
            await pages.reservationPage.expectNewUserOnlinePaymentAlertToBe();
        });

        const reservationDate = await pages.reservationPage.getStartDateInputValue();

        await test.step('Select the checkbox and send the form', async () => {
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitWithOnlinePayment();
        });

        await test.step('Enter correct data and proceed to payment', async () => {
            await pages.phoneConfirmationPage.expectEnteredNumberToBeVisible(generated.phoneNum);
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
            await pages.prePaymentPage.enterEmailAddress(reservation.email);
            await pages.prePaymentPage.goToPaymentMethod();
        });

        await test.step('After making the transfer, the reservation should be visible in the calendar', async () => {
            await pages.paymentMethodMenu.goToTransferPayment();
            await pages.transferPage.selectIngBankTransfer();
            await pages.bankPage.goToPay();
            await pages.reservationPage.expectReservationToBeCreated(reservationDate, generated.startHour, reservation.bandName, false);
        });
    });
});

test('Unsuccessful reservation of the date from the past', async () => {

    const reservation = {
        bandName: 'Hope',
        date: await pages.reservationPage.getSpecificDate('yesterday'),
        endHour: generated.startHour + 2,
    } as const;

    const lateReservationErrorMessage = 'Próbę można zarezerwować z minimalnym wyprzedzeniem 0 minut';

    await test.step('Fill inputs with correct data', async () => {
        await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
        await pages.reservationPage.selectReservationType(reservationType.records);
        await pages.reservationPage.enterBandName(reservation.bandName);
        await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
    });

    await test.step('After selecting date from the past, the error message should be visible', async () => {
        await pages.reservationPage.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
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
    });

    await test.step('After entering an end-hour that is earlier than the start-hour, error message should be visible', async () => {
        await pages.reservationPage.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
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

    await test.step('Fill the inputs with correct data', async () => {
        await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
        await pages.reservationPage.selectReservationType(reservationType.records);
        await pages.reservationPage.enterBandName(reservation.bandName);
        await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
    });

    await test.step('After entering the same start and end-hour, error message should be visible', async () => {
        await pages.reservationPage.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.reservationPage.expectEndDateErrorMessageToBe(hourErrorMessage);
    });
});

test('Unsuccessful creating a reservation for an already booked date', async () => {

    const reservation = {
        bandName1: 'Band Uno',
        bandName2: 'Band Los_Dos',
        date: await pages.reservationPage.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 2,
        email: 'hello@world.com',
    } as const;

    let reservationDate = '';
    const roomOccupancyErrorMessage = 'Czas rezerwacji pokrywa się z innymi wpisami.';

    await test.step('Book a rehear-room for the first band', async () => {
        await pages.reservationPage.fillTheReservationForm(roomsName.num2, reservationType.band, reservation.bandName1, generated.phoneNum, generated.startHour, reservation.endHour, reservation.date);
        await pages.reservationPage.submitWithOnlinePayment();

        reservationDate = await pages.reservationPage.getStartDateInputValue();

        await pages.phoneConfirmationPage.enterUserReservationCode();
        await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
        await pages.prePaymentPage.enterEmailAddress(reservation.email);
        await pages.prePaymentPage.goToPaymentMethod();
        await pages.paymentMethodMenu.goToTransferPayment();
        await pages.transferPage.selectIngBankTransfer();
        await pages.bankPage.goToPay();
        await pages.reservationPage.expectReservationToBeCreated(reservationDate, generated.startHour, reservation.bandName1, false);
    });

    await test.step('After creating a reservation for the same - already booked - date, an error message should appear', async () => {
        await pages.reservationPage.fillTheReservationForm(roomsName.num2, reservationType.band, reservation.bandName2, generated.phoneNum, generated.startHour, reservation.endHour, reservation.date);
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.reservationPage.expectEndDateErrorMessageToBe(roomOccupancyErrorMessage)
    });
});

test('Unsuccessful reservation when no room is selected', async () => {

    const reservation = {
        bandName: 'stokrotka',
        date: await pages.reservationPage.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 2,
    } as const;

    const reservationTypeErrorMessage = 'Pole type jest wymagane.';

    await test.step('When no specific room is selected, the reservation type selection should be disabled', async () => {
        await pages.reservationPage.selectRehearsalRoom(roomsName.all);
        await expect(pages.reservationPage.reservationTypeButton).toBeDisabled();
    });

    await test.step('Fill the rest of the form with correct data', async () => {
        await pages.reservationPage.enterBandName(reservation.bandName);
        await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithCashPayment();
    });

    await test.step('Unsuccessful reservation - both validation messages should be visible', async () => {
        await pages.reservationPage.expectRehearsalRoomErrorMessageToBe(emptyFieldErrorMessage);
        await pages.reservationPage.expectReservationTypeErrorMessageToBe(reservationTypeErrorMessage);
    });
});

test('Unsuccessful reservation when reservation type is not selected', async () => {

    const reservation = {
        bandName: 'Fiołki',
        date: await pages.reservationPage.getSpecificDate('day after tomorrow'),
        endHour: generated.startHour + 3,
    } as const;

    const reservationTypeErrorMessage = 'Pole type jest wymagane.';

    await test.step('Fill the form - except the reservation type field - with correct data', async () => {
        await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
        await pages.reservationPage.enterBandName(reservation.bandName);
        await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
    });

    await test.step('Unsuccessful reservation - the reservation type validation message should be visible', async () => {
        await pages.reservationPage.expectReservationTypeErrorMessageToBe(reservationTypeErrorMessage);
    });
});

test('Unsuccessful reservation when band name is not entered', async () => {

    const reservation = {
        date: await pages.reservationPage.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 3,
    } as const;

    await test.step('Fill the form with correct data - ensure band name input is empty', async () => {
        await pages.reservationPage.selectRehearsalRoom(roomsName.num2);
        await pages.reservationPage.selectReservationType(reservationType.records);
        await expect(pages.reservationPage.bandNameInput).toBeEmpty();
        await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
    });

    await test.step('Unsuccessful reservation - band name validation message should be visible', async () => {
        await pages.reservationPage.expectBandNameErrorMessageToBe(emptyFieldErrorMessage);
    });
});

test('Unsuccessful reservation when no phone number is entered', async () => {
    const reservation = {
        bandName: 'Wiewióry',
        date: await pages.reservationPage.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 1,
    } as const;

    await test.step('Fill the form with correct data - ensure phone number field is empty', async () => {
        await pages.reservationPage.selectRehearsalRoom(roomsName.num2);
        await pages.reservationPage.selectReservationType(reservationType.records);
        await pages.reservationPage.enterBandName(reservation.bandName);
        await expect(pages.reservationPage.phoneNumberInput).toBeEmpty();
        await pages.reservationPage.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithCashPayment();
    });

    await test.step('Unsuccessful reservation - phone num validation message should be visible', async () => {
        await pages.reservationPage.expectPhoneNumErrorMessageToBe(emptyFieldErrorMessage);
    });
});

test('Unsuccessful reservation when no end date is entered', async () => {

    const reservation = {
        bandName: 'E-agles',
        date: await pages.reservationPage.getSpecificDate('day after tomorrow'),
        endHour: generated.startHour + 2,
    } as const;

    await test.step('Fill the form with correct data - ensure end date is not selected', async () => {
        await pages.reservationPage.selectRehearsalRoom(roomsName.num1);
        await pages.reservationPage.selectReservationType(reservationType.band);
        await pages.reservationPage.enterBandName(reservation.bandName);
        await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.enterStartDate(reservation.date);
        await pages.reservationPage.enterStartTime(generated.startHour);
        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithCashPayment();
    });

    await test.step('Unsuccessful reservation - date validation message should be visible', async () => {
        await pages.reservationPage.expectEndDateErrorMessageToBe(emptyFieldErrorMessage);
    });
});

test('Unsuccessful reservation when agreement checkbox is not checked', async () => {

    const reservation = {
        bandName: 'Believers',
        date: await pages.reservationPage.getSpecificDate('tomorrow'),
        endHour: generated.startHour + 2,
    } as const;

    await test.step('Fill the form with correct data', async () => {
        await pages.reservationPage.selectRehearsalRoom(roomsName.num2);
        await pages.reservationPage.selectReservationType(reservationType.records);
        await pages.reservationPage.enterBandName(reservation.bandName);
        await pages.reservationPage.enterPhoneNumber(generated.phoneNum);
        await pages.reservationPage.enterDatesAndTime(reservation.date, generated.startHour, reservation.endHour);
    });

    await test.step('After sending the form without agreement checked, the form should still be visible with the entered data', async () => {
        await expect(pages.reservationPage.agreementCheckbox).not.toBeChecked();
        await pages.reservationPage.submitWithCashPayment();
        await expect(pages.reservationPage.reservationFormElement).toBeInViewport();
        await expect(pages.reservationPage.bandNameInput).toHaveValue(reservation.bandName);
    });
});

test.describe('Filters tests', async () => {

    // The payment-type selector has been tested in the payment-test already

    test('Successful creating reservations for different rooms at the same time - reservation-type selector works', async ({page}) => {
        const userInfo = {
            date: await pages.reservationPage.getSpecificDate('tomorrow'),
            startHour: await pages.reservationPage.generateRandomHour(),
        } as const;

        const endHour = userInfo.startHour + 2;

        const reservation1 = {
            bandName: 'Blow',
            email: 'blow@com.pl',
            phoneNumber: await pages.reservationPage.generateRandomPhoneNumber(),
        } as const;

        const reservation2 = {
            bandName: 'Henry_12',
            email: 'henry12@com.pl',
            phoneNumber: await pages.reservationPage.generateRandomPhoneNumber(),
        } as const;

        const reservation3 = {
            bandName: 'Hungry Wolfs',
            email: 'hungry-wolfs@com.pl',
            phoneNumber: await pages.reservationPage.generateRandomPhoneNumber(),
        } as const;

        let reservationDate;

        test.slow();

        await test.step('Create first reservation', async() => {
            await pages.reservationPage.fillTheReservationForm('Browar Miesczanski', 'Solo', reservation1.bandName, reservation1.phoneNumber, userInfo.startHour, endHour, userInfo.date);
            reservationDate = await pages.reservationPage.getStartDateInputValue();
            await pages.reservationPage.submitWithOnlinePayment();
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
            await pages.prePaymentPage.enterEmailAddress(reservation1.email);
            await pages.prePaymentPage.goToPaymentMethod();
            await pages.paymentMethodMenu.goToTransferPayment();
            await pages.transferPage.selectIngBankTransfer();
            await pages.bankPage.goToPay();
            await pages.reservationPage.expectReservationToBeCreated(reservationDate, userInfo.startHour, reservation1.bandName, false, false);
        });

        await test.step('Create second reservation for the same hour', async() => {
            await pages.reservationPage.fillTheReservationForm('Stary Mlyn', 'Nagrywka', reservation2.bandName, reservation2.phoneNumber, userInfo.startHour, endHour, userInfo.date);
            await pages.reservationPage.submitWithOnlinePayment();
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
            await pages.prePaymentPage.enterEmailAddress(reservation2.email);
            await pages.prePaymentPage.goToPaymentMethod();
            await pages.paymentMethodMenu.goToTransferPayment();
            await pages.transferPage.selectIngBankTransfer();
            await pages.bankPage.goToPay();
            await pages.reservationPage.expectReservationToBeCreated(reservationDate, userInfo.startHour, reservation2.bandName, false, false);
        });

        await test.step('Create third reservation for the same hour and go to the admin panel', async() => {
            await pages.reservationPage.fillTheReservationForm('Tęczowa 57', 'Zespół', reservation3.bandName, reservation3.phoneNumber, userInfo.startHour, endHour, userInfo.date);
            await pages.reservationPage.submitWithOnlinePayment();
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
            await pages.prePaymentPage.enterEmailAddress(reservation3.email);
            await pages.prePaymentPage.goToPaymentMethod();
            await pages.paymentMethodMenu.goToTransferPayment();
            await pages.transferPage.selectIngBankTransfer();
            await pages.bankPage.goToPay();
            await pages.reservationPage.expectReservationToBeCreated(reservationDate, userInfo.startHour, reservation3.bandName, false, false);

            await page.goto('#admin');
            await page.reload();
            await pages.adminLoginPage.loginTheUser(adminPassword);
        });

        await test.step('When reservationType is selected, only relevant reservations should be displayed', async() => {
            await pages.adminReservationPage.selectReservationType('Solo');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, userInfo.startHour, reservation1.bandName, true);
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation2.bandName)).not.toBeVisible();
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation3.bandName)).not.toBeVisible();

            await pages.adminReservationPage.selectReservationType('Nagrywka');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, userInfo.startHour, reservation2.bandName, true);
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation1.bandName)).not.toBeVisible();
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation3.bandName)).not.toBeVisible();

            await pages.adminReservationPage.selectReservationType('Zespół');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, userInfo.startHour, reservation3.bandName, true);
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation2.bandName)).not.toBeVisible();
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation1.bandName)).not.toBeVisible();
        });
    });
});
