import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async({page}) => {
   pages = initialise(page);

   await page.goto('/');
});


test('Successful online payment', async() => {
    const reservation = {
        bandName: 'Mars&Stones',
        phone: await pages.reservationPage.generateRandomPhoneNumber(),
        date: await pages.reservationPage.getSpecificDate('day after tomorrow'),
        startHour: await pages.reservationPage.generateRandomHour(),
    } as const;

    const endHour = reservation.startHour + 2;
    const email = 'songs@karaoke.pl';

    await test.step('Fill the reservation form with correct data', async() => {
        await pages.reservationPage.selectRehearsalRoom('Stary Mlyn');
        await pages.reservationPage.selectReservationType('Nagrywka');
        await pages.reservationPage.enterBandName(reservation.bandName);
        await pages.reservationPage.enterPhoneNumber(reservation.phone);
        await pages.reservationPage.enterDatesAndTime(reservation.date, reservation.startHour, endHour);
        await pages.reservationPage.selectAgreementCheckbox();
    });

    const reservationDate = await pages.reservationPage.getStartDateValue();
    const currentReservationPrice = await pages.reservationPage.getOnlineReservationPrice();

    await test.step('Go to online payment and enter reservation code', async() => {
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.phoneConfirmationPage.expectEnteredNumberToBeVisible(reservation.phone);
        await pages.phoneConfirmationPage.enterUserReservationCode();
        await pages.phoneConfirmationPage.confirmReservation();
    });

    await test.step('Enter email address and go to transfer payment - the amount should be the same as at the beginning', async() => {
        await expect(pages.prePaymentPage.emailVerificationContainer).toBeVisible();
        await pages.prePaymentPage.enterEmailAddress(email);
        await pages.prePaymentPage.goToPaymentMethod();
        await expect(pages.paymentMethodMenu.paymentContainer).toBeVisible();
        await pages.paymentMethodMenu.goToTransferPayment();
        await pages.transferPage.paymentMethodMenu.expectTransactionAmountToBe(currentReservationPrice);
    });

    await test.step('Select transfer method - after paying, the reservation should be created properly at calendar', async() => {
        await pages.transferPage.selectIngBankTransfer();
        await pages.bankPage.expectTransactionAmountToBe(currentReservationPrice);
        await pages.bankPage.goToPay();
        await pages.reservationPage.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName, false);
    });
});