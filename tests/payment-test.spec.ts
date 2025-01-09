import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async({page}) => {
   pages = initialise(page);

   await page.goto('/');
});


test('Successful online payment', async({page}) => {
    const reservation = {
        bandName: 'Mars&Stones',
        phone: await pages.reservationPage.generateRandomPhoneNumber(),
        date: await pages.reservationPage.getSpecificDate('day after tomorrow'),
        startHour: await pages.reservationPage.generateRandomHour(),
    } as const;

    const endHour = reservation.startHour + 2;
    const email = 'songs@karaoke.pl';

    await pages.reservationPage.selectRehearsalRoom('Stary Mlyn');
    await pages.reservationPage.selectReservationType('Nagrywka');
    await pages.reservationPage.enterBandName(reservation.bandName);
    await pages.reservationPage.enterPhoneNumber(reservation.phone);
    await pages.reservationPage.enterReservationDate(reservation.date);
    await pages.reservationPage.selectReservationTime(String(reservation.startHour), String(endHour));
    await pages.reservationPage.selectAgreementCheckbox();

    const currentReservationPrice = await pages.reservationPage.getOnlineReservationPrice();

    await pages.reservationPage.submitWithOnlinePayment();
    await pages.phoneConfirmationPage.expectEnteredNumberToBeVisible(reservation.phone);
    await pages.phoneConfirmationPage.enterUserReservationCode();
    await pages.phoneConfirmationPage.confirmReservation();
    await expect(pages.prePaymentPage.emailVerificationContainer).toBeVisible();
    await pages.prePaymentPage.enterEmailAddress(email);
    await pages.prePaymentPage.goToPayment();
    await expect(pages.paymentMethodMenu.paymentContainer).toBeVisible();
    await pages.paymentMethodMenu.goToTransferPayment();
    await pages.transferPage.paymentMethodMenu.expectTransactionAmountToBe(currentReservationPrice);
    await pages.transferPage.selectIngBankTransfer();
    await pages.bankPage.expectTransactionAmountToBe(currentReservationPrice);
    await pages.bankPage.goToPay();

});