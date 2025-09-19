import initialise from "./PageObjects/initialise";
import {expect, test} from "@playwright/test";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async({page}) => {
    pages = initialise(page);
});

test.describe('Filters tests', async () => {

    // The payment-type selector has been tested in the payment-test already

    test('Reservation-type selector works', async ({page}) => {
        const userInfo = {
            date: await pages.reservationPage.getSpecificDate('tomorrow'),
            startHour: await pages.reservationPage.generateRandomHour(),
        } as const;

        const endHour = userInfo.startHour + 2;

        const reservation1 = {
            bandName: 'Blow',
            phoneNumber: await pages.reservationPage.generateRandomPhoneNumber(),
        } as const;

        const reservation2 = {
            bandName: 'Henry_12',
            phoneNumber: await pages.reservationPage.generateRandomPhoneNumber(),
        } as const;

        const reservation3 = {
            bandName: 'Hungry Wolfs',
            phoneNumber: await pages.reservationPage.generateRandomPhoneNumber(),
        } as const;

        let reservationDate: string;

        test.slow();

        await test.step('Create first reservation', async() => {
            await pages.reservationPage.fillTheReservationForm('Browar Miesczanski', 'Solo', reservation1.bandName, reservation1.phoneNumber, userInfo.startHour, endHour, userInfo.date);
            reservationDate = await pages.reservationPage.getStartDateInputValue();
            await pages.reservationPage.submitWithOnlinePayment();
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
            await pages.prePaymentPage.enterEmailAddress();
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
            await pages.prePaymentPage.enterEmailAddress();
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
            await pages.prePaymentPage.enterEmailAddress();
            await pages.prePaymentPage.goToPaymentMethod();
            await pages.paymentMethodMenu.goToTransferPayment();
            await pages.transferPage.selectIngBankTransfer();
            await pages.bankPage.goToPay();
            await pages.reservationPage.expectReservationToBeCreated(reservationDate, userInfo.startHour, reservation3.bandName, false, false);

            await page.goto('#admin');
            await pages.adminLoginPage.loginTheUser();
        });

        await test.step('When reservationType is selected, only relevant reservations should be displayed', async() => {
            await pages.adminReservationPage.filters.filterByReservationType('Solo');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, userInfo.startHour, reservation1.bandName, true);
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation2.bandName)).toBeHidden();
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation3.bandName)).toBeHidden();

            await pages.adminReservationPage.filters.filterByReservationType('Nagrywka');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, userInfo.startHour, reservation2.bandName, true);
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation1.bandName)).toBeHidden();
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation3.bandName)).toBeHidden();

            await pages.adminReservationPage.filters.filterByReservationType('Zespół');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, userInfo.startHour, reservation3.bandName, true);
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation2.bandName)).toBeHidden();
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservationDate, userInfo.startHour, reservation1.bandName)).toBeHidden();
        });
    });
});