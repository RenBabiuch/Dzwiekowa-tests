import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({page}) => {
    pages = initialise(page);

    await page.goto('');
});

const adminPassword = '12345';

test.describe('Online payments', async () => {
    test('Successful online payment', async () => {
        const reservation = {
            bandName: 'Mars&Stones',
            phone: await pages.reservationPage.generateRandomPhoneNumber(),
            date: await pages.reservationPage.getSpecificDate('day after tomorrow'),
            startHour: await pages.reservationPage.generateRandomHour(),
            email: 'songs@karaoke.pl',
        } as const;
        const endHour = reservation.startHour + 2;

        await test.step('Fill the reservation form with correct data', async () => {
            await pages.reservationPage.selectRehearsalRoom('Stary Mlyn');
            await pages.reservationPage.selectReservationType('Nagrywka');
            await pages.reservationPage.enterBandName(reservation.bandName);
            await pages.reservationPage.enterPhoneNumber(reservation.phone);
            await pages.reservationPage.enterDatesAndTime(reservation.date, reservation.startHour, endHour);
            await pages.reservationPage.selectAgreementCheckbox();
        });

        const reservationDate = await pages.reservationPage.getStartDateInputValue();
        const currentReservationPrice = await pages.reservationPage.getOnlineReservationPrice();

        await test.step('Go to online payment and enter reservation code', async () => {
            await pages.reservationPage.submitWithOnlinePayment();
            await pages.phoneConfirmationPage.expectEnteredNumberToBeVisible(reservation.phone);
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
        });

        await test.step('Enter email address and go to transfer payment - the amount should be the same as at the beginning', async () => {
            await expect(pages.prePaymentPage.emailVerificationContainer).toBeVisible();
            await pages.prePaymentPage.enterEmailAddress(reservation.email);
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
            phoneNum: await pages.reservationPage.generateRandomPhoneNumber(),
            email: 'hey_dudes@com.pl',
        } as const;

        const reservation1 = {
            startDate: await pages.reservationPage.getSpecificDate('today'),
            startHour: await pages.reservationPage.getNextHour(),
        } as const;

        const reservation2 = {
            startDate: await pages.reservationPage.getSpecificDate('tomorrow'),
            startHour: await pages.reservationPage.generateRandomHour(),
        } as const;

        let reservation1date;
        let reservation2date;

        await test.step('Create online-payment reservation starting in an hour - the user won`t be able to cancel already', async () => {
            const endHour = reservation1.startHour + 2;

            await pages.reservationPage.fillTheReservationForm('Browar Miesczanski', 'Solo', userInfo.bandName, userInfo.phoneNum, reservation1.startHour, endHour, reservation1.startDate);
            reservation1date = await pages.reservationPage.getStartDateInputValue();

            await expect(pages.reservationPage.submitWithCashPaymentButton).not.toBeVisible();
            await pages.reservationPage.submitWithOnlinePayment();
            await pages.phoneConfirmationPage.enterUserReservationCode();
            await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
            await pages.prePaymentPage.enterEmailAddress(userInfo.email);
            await pages.prePaymentPage.goToPaymentMethod();
            await pages.paymentMethodMenu.goToTransferPayment();
            await pages.transferPage.selectIngBankTransfer();
            await pages.bankPage.goToPay();
            await pages.reservationPage.expectReservationToBeCreated(reservation1date, reservation1.startHour, userInfo.bandName, false, false);
        });

        await test.step('After creating second reservation for the same user, cash payment should be possible', async () => {
            const endHour = reservation2.startHour + 2;

            await pages.reservationPage.fillTheReservationForm('Browar Miesczanski', 'Nagrywka', userInfo.bandName, userInfo.phoneNum, reservation2.startHour, endHour, reservation2.startDate);
            reservation2date = await pages.reservationPage.getStartDateInputValue();

            await expect(pages.reservationPage.submitWithCashPaymentButton).toBeVisible();
            await pages.reservationPage.submitWithCashPayment();
            await expect(pages.reservationPage.successfulReservationAlert).toBeVisible();
            await pages.reservationPage.expectReservationToBeCreated(reservation2date, reservation2.startHour, userInfo.bandName, true, false);
        });

        await test.step('When paymentType is selected, only relevant reservations should be displayed', async() => {
            await page.goto('#admin');
            await pages.adminLoginPage.loginTheUser(adminPassword);
            await pages.adminReservationPage.selectPaymentType('wszystkie');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservation1date, reservation1.startHour, userInfo.bandName, true);
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservation2date, reservation2.startHour, userInfo.bandName, true);

            await pages.adminReservationPage.selectPaymentType('online');
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservation1date, reservation1.startHour, userInfo.bandName, true);
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservation2date, reservation2.startHour, userInfo.bandName)).not.toBeVisible();

            await pages.adminReservationPage.selectPaymentType('cash');
            await expect(await pages.adminReservationPage.calendar.getPreviewOfReservationElement(reservation1date, reservation1.startHour, userInfo.bandName)).not.toBeVisible();
            await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservation2date, reservation2.startHour, userInfo.bandName, true);
        });

        await test.step('Online-payment reservation should be marked in admin panel as first', async () => {
            await page.reload();
            await expect(pages.adminReservationPage.firstReservationAdnotation).toBeVisible();
            await pages.adminReservationPage.calendar.expectReservationNotToBeMarkedAsFirst(reservation2date, reservation2.startHour, userInfo.bandName);
            await pages.adminReservationPage.calendar.expectReservationToBeMarkedAsFirst(reservation1date, reservation1.startHour, userInfo.bandName);
        });
    });
});