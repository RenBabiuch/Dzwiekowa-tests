import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({page}) => {
    pages = initialise(page)

    await page.goto('');
});

test('Reservation with correct data is visible in the admin panel and can be canceled with refund', async ({page}) => {
    const reservation = {
        bandName: 'Harry Potty',
        phone: await pages.reservationPage.reservationForm.generateRandomPhoneNumber(),
        date: await pages.reservationPage.reservationForm.getSpecificDate('day after tomorrow'),
        startHour: await pages.reservationPage.reservationForm.generateRandomHour(),
        paymentMethod: 'Online',
    } as const;

    const endHour = reservation.startHour + 2;
    const fakePhoneNum = '777222333';
    let reservationDate;
    let currentPrice;

       await test.step('Create a valid reservation in user`s view - it should be visible in calendar', async() => {
        await pages.reservationPage.fillTheFormAndCheckCheckbox('Browar Miesczanski', 'Zespół', reservation.bandName, reservation.phone, reservation.startHour, endHour, reservation.date);

        reservationDate = await pages.reservationPage.reservationForm.getStartDateInputValue();
        currentPrice = await pages.reservationPage.getOnlineReservationPrice();

        await pages.reservationPage.submitWithOnlinePayment();
        await pages.phoneConfirmationPage.enterUserReservationCode();
        await pages.phoneConfirmationPage.confirmAndGoToPrePayment();
        await pages.prePaymentPage.enterEmailAddress();
        await pages.prePaymentPage.goToPaymentMethod();
        await pages.paymentMethodMenu.goToTransferPayment();
        await pages.transferPage.selectIngBankTransfer();
        await pages.bankPage.goToPay();
        await pages.reservationPage.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName, false, false);
    });

    await test.step('After login to admin panel, reservation should be visible as well', async() => {
        await page.goto('#admin');
        await page.reload();
        await pages.adminLoginPage.loginTheUser();
        await expect(pages.adminReservationPage.calendarElement).toBeVisible();
        await pages.reservationPage.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName, false, true);
    });

    await test.step('After clicking on the reservation window, its details with correct data should appear', async() => {
        await pages.adminReservationPage.calendar.clickToSeeReservationDetails(reservationDate, reservation.startHour, reservation.bandName);
        await expect(pages.adminReservationDetailsPage.reservationDetailsContainer).toBeVisible();
        await pages.adminReservationDetailsPage.expectBandNameToBe(reservation.bandName);
        await pages.adminReservationDetailsPage.expectPhoneNumToBe(reservation.phone);
        await pages.adminReservationDetailsPage.expectReservationPriceToBe(currentPrice);
        await pages.adminReservationDetailsPage.expectPaymentMethodToBe(reservation.paymentMethod);
        await pages.adminReservationDetailsPage.closeReservationDetails();
    });

    await test.step('Reservation should not be visible in the canceled reservation view, before it is canceled', async() => {
        await pages.adminReservationPage.filters.filterByReservationScope('Anulowane');
        await expect(await pages.adminReservationPage.calendar.getAdminReservationElement(reservationDate, reservation.startHour, reservation.bandName)).not.toBeVisible();
    });

    await test.step('After filtering reservations by phone number, only reservations with correct number should be displayed', async() => {
        await pages.adminReservationPage.filters.filterByReservationScope('Aktywne');
        await pages.adminReservationPage.filters.filterReservationByPhoneNum(fakePhoneNum);
        await expect(await pages.adminReservationPage.calendar.getAdminReservationElement(reservationDate, reservation.startHour, reservation.bandName)).not.toBeVisible();
        await pages.adminReservationPage.filters.filterReservationByPhoneNum(reservation.phone);
        await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, reservation.startHour, reservation.bandName, true);
    });

    await test.step('When reservation is canceled, its preview should disappear - except canceled reservations view', async() => {
        await pages.adminReservationPage.calendar.clickToSeeReservationDetails(reservationDate, reservation.startHour, reservation.bandName);
        await pages.adminReservationDetailsPage.cancelReservationWithRefund();
        await page.reload();
        await expect(await pages.adminReservationPage.calendar.getAdminReservationElement(reservationDate, reservation.startHour, reservation.bandName)).not.toBeVisible();
        await pages.adminReservationPage.filters.filterByReservationScope('Anulowane');
        await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, reservation.startHour, reservation.bandName, true);
    });

    await test.step('After filtering in canceled reservation view, only reservations with correct number should be displayed too', async() => {
        await pages.adminReservationPage.filters.filterReservationByPhoneNum(fakePhoneNum);
        await expect(await pages.adminReservationPage.calendar.getAdminReservationElement(reservationDate, reservation.startHour, reservation.bandName)).not.toBeVisible();
        await pages.adminReservationPage.filters.filterReservationByPhoneNum(reservation.phone);
        await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, reservation.startHour, reservation.bandName, true);
    });
});