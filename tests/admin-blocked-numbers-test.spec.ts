import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
let reservation: {date: Date; bandName: string; startHour: number};
test.beforeEach(async ({page}) => {
    pages = initialise(page)

     reservation = {
        bandName: 'Timanfaya',
        date: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
        startHour: await pages.reservationPage.reservationForm.generateRandomHour(),
    } as const;

});

test('Complete blocking phone numbers works', async({page}) => {

    const reasonForBlocking = 'Zniszczenie instrumentów';
    const phoneNumErrorMessage = 'Ten numer ma zablokowaną opcję dodawania rezerwacji. Skontaktuj się z nami w celu wyjaśnienia sprawy';
    const endHour =  reservation.startHour + 2;
    const blockedNumber = '579825437';

    test.slow();

    await test.step('Go to create first reservation', async() => {
        await page.goto('');
        await pages.reservationPage.fillTheFormAndCheckCheckbox('Browar Miesczanski', 'Zespół', reservation.bandName, blockedNumber, reservation.startHour, endHour, reservation.date);

        let reservationDate = await pages.reservationPage.reservationForm.getStartDateInputValue();

        await pages.reservationPage.submitWithOnlinePayment();
        await pages.phoneConfirmationPage.enterUserReservationCode();
        await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
        await pages.prePaymentPage.enterEmailAddress();
        await pages.prePaymentPage.goToPaymentMethod();
        await pages.paymentMethodMenu.goToTransferPayment();
        await pages.transferPage.selectIngBankTransfer();
        await pages.bankPage.goToPay();
        await pages.reservationPage.reservationForm.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName);
    });

    await test.step('Go to block the phone number of the problematic user', async() => {
        await page.goto('#admin');
        await pages.adminLoginPage.loginTheUser();
        await pages.adminReservationPage.adminHeader.goToBlockNumbers();
        await pages.adminBlockedNumbersPage.fillAndConfirmBlockNumberForm(blockedNumber, 'blocked', reasonForBlocking);
        await expect(pages.adminBlockedNumbersPage.blockedNumbersContainer).toBeVisible();
        await expect(await pages.adminBlockedNumbersPage.blockedNumberElement(blockedNumber)).toBeVisible();
    });

        const reservationNewStartHour = reservation.startHour + 3;
        const reservationNewEndHour = reservationNewStartHour + 2;

    await test.step('Go to create reservation with blocked number - the phone number error message should appear', async() => {
        await page.goto('');
        await page.reload();
        await pages.reservationPage.fillTheFormAndCheckCheckbox('Browar Miesczanski', 'Zespół', reservation.bandName, blockedNumber, reservationNewStartHour, reservationNewEndHour, reservation.date);
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.reservationPage.reservationForm.expectPhoneNumErrorMessageToBe(phoneNumErrorMessage);
    });

    await test.step('After unblocking the number, it should be possible to create a reservation', async() => {
        await page.goto('#admin');
        await page.reload();
        await pages.adminReservationPage.adminHeader.goToBlockNumbers();
        await expect(await pages.adminBlockedNumbersPage.blockedNumberElement(blockedNumber)).toBeVisible();
        await pages.adminBlockedNumbersPage.unlockPhoneNumber(blockedNumber);
        await expect(await pages.adminBlockedNumbersPage.blockedNumberElement(blockedNumber)).not.toBeVisible();

        await page.goto('');
        await page.reload();
        await pages.reservationPage.fillTheFormAndCheckCheckbox('Browar Miesczanski', 'Zespół', reservation.bandName, blockedNumber, reservationNewStartHour, reservationNewEndHour, reservation.date);

        let reservationNewDate = await pages.reservationPage.reservationForm.getStartDateInputValue();

        await pages.reservationPage.submitWithOnlinePayment();
        await pages.prePaymentPage.enterEmailAddress();
        await pages.prePaymentPage.goToPaymentMethod();
        await pages.paymentMethodMenu.goToTransferPayment();
        await pages.transferPage.selectIngBankTransfer();
        await pages.bankPage.goToPay();
        await pages.reservationPage.reservationForm.expectReservationToBeCreated(reservationNewDate, reservationNewStartHour, reservation.bandName);
    });
});