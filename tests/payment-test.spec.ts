import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({page}) => {
    pages = initialise(page);

    await page.goto('');
});

test.describe('Online payments', async () => {
    test('Successful online payment', async () => {
        const reservation = {
            bandName: 'Mars&Stones',
            phone: await pages.reservationPage.reservationForm.generateRandomPhoneNumber(),
            date: await pages.reservationPage.reservationForm.getSpecificDate('day after tomorrow'),
            startHour: await pages.reservationPage.reservationForm.generateRandomHour(),
        } as const;
        const endHour = reservation.startHour + 2;

        await test.step('Fill the reservation form with correct data', async () => {
            await pages.reservationPage.reservationForm.selectRehearsalRoom('Stary Mlyn');
            await pages.reservationPage.reservationForm.selectReservationType('Nagrywka');
            await pages.reservationPage.reservationForm.enterBandName(reservation.bandName);
            await pages.reservationPage.reservationForm.enterPhoneNumber(reservation.phone);
            await pages.reservationPage.reservationForm.enterDatesAndTime(reservation.date, reservation.startHour, endHour);
            await pages.reservationPage.selectAgreementCheckbox();
        });

        const reservationDate = await pages.reservationPage.reservationForm.getStartDateInputValue();
        const currentReservationPrice = await pages.reservationPage.getOnlineReservationPrice();

        await test.step('Go to online payment and enter reservation code', async () => {
            await pages.reservationPage.submitWithOnlinePayment();
            await pages.phoneConfirmationPage.expectEnteredNumberToBeVisible(reservation.phone);
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
        });

        await test.step('Enter email address and go to transfer payment - the amount should be the same as at the beginning', async () => {
            await expect(pages.prePaymentPage.emailVerificationContainer).toBeVisible();
            await pages.prePaymentPage.enterEmailAddress();
            await pages.prePaymentPage.goToPaymentMethod();
            await expect(pages.paymentMethodMenu.paymentContainer).toBeVisible();
            await pages.paymentMethodMenu.goToTransferPayment();
            await pages.transferPage.paymentMethodMenu.expectTransactionAmountToBe(currentReservationPrice);
        });

        await test.step('Select transfer method - after paying, the reservation should be created properly at calendar', async () => {
            await pages.transferPage.selectIngBankTransfer();
            await pages.bankPage.expectTransactionAmountToBe(currentReservationPrice);
            await pages.bankPage.goToPay();
            await pages.reservationPage.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName, false);
        });
    });
});

test.describe('Cash payment', async () => {
    test('Successful cash payment, when first online reservation was not cancelled', async ({page}) => {

        const userInfo = {
            bandName: 'Hey_Dudes',
            phoneNum: await pages.reservationPage.reservationForm.generateRandomPhoneNumber(),
        } as const;

        const reservation1 = {
            startDate: await pages.reservationPage.reservationForm.getSpecificDate('today'),
            startHour: await pages.reservationPage.reservationForm.getNextHour(),
        } as const;

        const reservation2 = {
            startDate: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
            startHour: await pages.reservationPage.reservationForm.generateRandomHour(),
        } as const;

        let reservation1date;
        let reservation2date;

        await test.step('Create online-payment reservation starting in an hour - the user won`t be able to cancel already', async () => {
            const endHour = reservation1.startHour + 2;

            await pages.reservationPage.reservationForm.enterDataToTheReservationForm('Browar Miesczanski', 'Solo', userInfo.bandName, userInfo.phoneNum, reservation1.startHour, endHour, reservation1.startDate);
            reservation1date = await pages.reservationPage.reservationForm.getStartDateInputValue();

            await pages.reservationPage.selectAgreementCheckbox();
            await expect(pages.reservationPage.submitWithCashPaymentButton).not.toBeVisible();
            await pages.reservationPage.submitWithOnlinePayment();
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
            await pages.prePaymentPage.enterEmailAddress();
            await pages.prePaymentPage.goToPaymentMethod();
            await pages.paymentMethodMenu.goToTransferPayment();
            await pages.transferPage.selectIngBankTransfer();
            await pages.bankPage.goToPay();
            await pages.reservationPage.expectReservationToBeCreated(reservation1date, reservation1.startHour, userInfo.bandName, false, false);
        });

        await test.step('After creating second reservation for the same user, cash payment should be possible', async () => {
            const endHour = reservation2.startHour + 2;

            await pages.reservationPage.reservationForm.enterDataToTheReservationForm('Browar Miesczanski', 'Nagrywka', userInfo.bandName, userInfo.phoneNum, reservation2.startHour, endHour, reservation2.startDate);
            reservation2date = await pages.reservationPage.reservationForm.getStartDateInputValue();

            await pages.reservationPage.selectAgreementCheckbox();
            await expect(pages.reservationPage.submitWithCashPaymentButton).toBeVisible();
            await pages.reservationPage.submitWithCashPayment();
            await expect(pages.reservationPage.reservationForm.successfulReservationAlert).toBeVisible();
            await pages.reservationPage.expectReservationToBeCreated(reservation2date, reservation2.startHour, userInfo.bandName, true, false);
        });

        await test.step('When paymentType is selected, only relevant reservations should be displayed', async () => {
            await page.goto('#admin');
            await pages.adminLoginPage.loginTheUser();
            await pages.adminReservationPage.filters.filterByPaymentType('wszystkie');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservation1date, reservation1.startHour, userInfo.bandName, true);
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservation2date, reservation2.startHour, userInfo.bandName, true);

            await pages.adminReservationPage.filters.filterByPaymentType('online');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservation1date, reservation1.startHour, userInfo.bandName, true);
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservation2date, reservation2.startHour, userInfo.bandName)).not.toBeVisible();

            await pages.adminReservationPage.filters.filterByPaymentType('cash');
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservation1date, reservation1.startHour, userInfo.bandName)).not.toBeVisible();
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservation2date, reservation2.startHour, userInfo.bandName, true);
        });

        await test.step('Online-payment reservation should be marked in admin panel as first', async () => {
            await page.reload();
            await expect(pages.adminReservationPage.filters.firstReservationAdnotation).toBeVisible();
            await pages.adminReservationPage.calendar.expectReservationNotToBeMarkedAsFirst(reservation2date, reservation2.startHour, userInfo.bandName);
            await pages.adminReservationPage.calendar.expectReservationToBeMarkedAsFirst(reservation1date, reservation1.startHour, userInfo.bandName);
        });
    });
});