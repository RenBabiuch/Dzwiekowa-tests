import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({page}) => {
    pages = initialise(page);

    await page.goto('');
});

    const phoneNumErrorMessage = 'Ten numer ma zablokowaną opcję dodawania rezerwacji. Skontaktuj się z nami w celu wyjaśnienia sprawy';

test('Blocking phone numbers from the Block-Number Page - works', async({page}) => {

    const reservation = {
        bandName: 'Timanfaya',
        phoneNumber: await pages.reservationPage.reservationForm.generateRandomPhoneNumber(),
        date: await pages.reservationPage.reservationForm.getSpecificDate('tomorrow'),
        startHour: await pages.reservationPage.reservationForm.generateRandomHour(),
    };

    const reasonForBlocking = 'Zniszczenie instrumentów';
    const endHour =  reservation.startHour + 2;

    test.slow();

    await test.step('Go to create first reservation', async() => {
        await pages.reservationPage.reservationForm.enterDataToTheReservationForm('Browar Miesczanski', 'Zespół', reservation.bandName, reservation.phoneNumber, reservation.startHour, endHour, reservation.date);

        let reservationDate = await pages.reservationPage.reservationForm.getStartDateInputValue();

        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.phoneConfirmationPage.enterUserReservationCode();
        await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
        await pages.prePaymentPage.enterEmailAddress();
        await pages.prePaymentPage.goToPaymentMethod();
        await pages.paymentMethodMenu.goToTransferPayment();
        await pages.transferPage.selectIngBankTransfer();
        await pages.bankPage.goToPay();
        await pages.reservationPage.reservationForm.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName, false, false);
    });

    await test.step('Go to block the phone number of the problematic user', async() => {
        await pages.adminLoginPage.goToAdminPanel();
        await pages.adminLoginPage.loginTheUser();
        await pages.adminReservationPage.adminHeader.goToBlockNumbers();
        await pages.adminBlockedNumbersPage.fillAndConfirmBlockNumberForm(reservation.phoneNumber, 'blocked', reasonForBlocking);
        await expect(pages.adminBlockedNumbersPage.blockedNumbersContainer).toBeVisible();
        await expect(pages.adminBlockedNumbersPage.getBlockedNumberElement(reservation.phoneNumber)).toBeVisible();
    });

        const reservationNewStartHour = reservation.startHour + 3;
        const reservationNewEndHour = reservationNewStartHour + 2;

    await test.step('Go to create reservation with blocked number - the phone number error message should appear', async() => {
        await pages.adminLoginPage.goBackToUserPanel();
        await pages.reservationPage.fillTheFormAndCheckCheckbox('Browar Miesczanski', 'Zespół', reservation.bandName, reservation.phoneNumber, reservationNewStartHour, reservationNewEndHour, reservation.date);
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.reservationPage.reservationForm.expectPhoneNumErrorMessageToBe(phoneNumErrorMessage);
    });

    await test.step('After unblocking the number, it should be possible to create a reservation', async() => {
        await pages.adminLoginPage.goToAdminPanel();
        await pages.adminReservationPage.adminHeader.goToBlockNumbers();
        await expect(pages.adminBlockedNumbersPage.getBlockedNumberElement(reservation.phoneNumber)).toBeVisible();
        await pages.adminBlockedNumbersPage.unlockPhoneNumber(reservation.phoneNumber);
        await expect(pages.adminBlockedNumbersPage.getBlockedNumberElement(reservation.phoneNumber)).not.toBeVisible();

        await pages.adminLoginPage.goBackToUserPanel();
        await pages.reservationPage.reservationForm.enterDataToTheReservationForm('Browar Miesczanski', 'Zespół', reservation.bandName, reservation.phoneNumber, reservationNewStartHour, reservationNewEndHour, reservation.date);

        let reservationNewDate = await pages.reservationPage.reservationForm.getStartDateInputValue();

        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.prePaymentPage.enterEmailAddress();
        await pages.prePaymentPage.goToPaymentMethod();
        await pages.paymentMethodMenu.goToTransferPayment();
        await pages.transferPage.selectIngBankTransfer();
        await pages.bankPage.goToPay();
        await pages.reservationPage.reservationForm.expectReservationToBeCreated(reservationNewDate, reservationNewStartHour, reservation.bandName, false, false);
    });
});

test('Blocking phone numbers from the reservation details level - works', async({page}) => {

    const userInfo = {
        bandName: 'details_of_music',
        phoneNumber: await pages.reservationPage.reservationForm.generateRandomPhoneNumber(),
        date: await pages.reservationPage.reservationForm.getSpecificDate('day after tomorrow'),
        blockReason: 'Band plays too loud',
    } as const;

    const reservationStartHour = await pages.reservationPage.reservationForm.generateRandomHour();
    const reservationEndHour = reservationStartHour + 2;

    const reservationNewStartHour = reservationEndHour + 2;
    const reservationNewEndHour = reservationNewStartHour + 2;

    let reservationDate;
    let reservationPrice;

    test.slow();

    await test.step('Create reservation and log in to admin panel', async() => {
        await pages.reservationPage.reservationForm.enterDataToTheReservationForm('Tęczowa 57', 'Zespół', userInfo.bandName, userInfo.phoneNumber, reservationStartHour, reservationEndHour, userInfo.date);
        reservationDate = await pages.reservationPage.reservationForm.getStartDateInputValue();
        reservationPrice = await pages.reservationPage.getOnlineReservationPrice();

        await pages.reservationPage.selectAgreementCheckbox();
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.phoneConfirmationPage.enterUserReservationCode();
        await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
        await pages.prePaymentPage.enterEmailAddress();
        await pages.prePaymentPage.goToPaymentMethod();
        await pages.paymentMethodMenu.goToTransferPayment();
        await pages.transferPage.selectIngBankTransfer();
        await pages.bankPage.goToPay();
        await pages.reservationPage.reservationForm.expectReservationToBeCreated(reservationDate, reservationStartHour, userInfo.bandName, false, false);

        await pages.adminLoginPage.goToAdminPanel();
        await pages.adminLoginPage.loginTheUser();
    });

    await test.step('Open reservation details and block phone number - details should be visible in the Block-Number Page', async() => {
        await pages.adminReservationPage.calendar.clickToSeeReservationDetails(reservationDate, reservationStartHour,userInfo.bandName);
        await pages.adminReservationDetailsPage.blockPhoneNumber();
        await expect(pages.adminBlockedNumbersPage.blockedNumbersContainer).toBeVisible();
        await pages.adminBlockedNumbersPage.enterBlockNumberReason(userInfo.blockReason);
        await pages.adminBlockedNumbersPage.confirmNumberBlocking();
        await expect(pages.adminBlockedNumbersPage.getBlockedNumberElement(userInfo.phoneNumber)).toBeVisible();
        await pages.adminBlockedNumbersPage.expectReservationDetailsOfBlockedNumberToBeVisible(userInfo.phoneNumber, userInfo.bandName, reservationDate, reservationStartHour, reservationEndHour, reservationPrice);
    });

    await test.step('After creating new reservation for blocked number - error message should be displayed', async() => {
        await pages.adminLoginPage.goBackToUserPanel();
        await pages.reservationPage.fillTheFormAndCheckCheckbox('Tęczowa 57', 'Zespół', userInfo.bandName, userInfo.phoneNumber, reservationNewStartHour, reservationNewEndHour, userInfo.date);
        await pages.reservationPage.submitWithOnlinePayment();
        await pages.reservationPage.reservationForm.expectPhoneNumErrorMessageToBe(phoneNumErrorMessage);
    });
});