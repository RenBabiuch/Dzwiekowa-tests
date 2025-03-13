import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({page}) => {
    pages = initialise(page)

    await page.goto('/');
});

test('Reservation with correct data is visible in the admin panel and can be canceled', async ({page}) => {
    const reservation = {
        bandName: 'New area band 999',
        phone: await pages.reservationPage.generateRandomPhoneNumber(),
        date: await pages.reservationPage.getSpecificDate('tomorrow'),
        startHour: await pages.reservationPage.generateRandomHour(),
        paymentMethod: 'Gotówka',
    } as const;

    const endHour = reservation.startHour + 2;
    const adminPassword = '12345';
    const fakePhoneNum = '777222333';
    let reservationDate;
    let currentPrice;

    await test.step('Create a valid reservation in user`s view - it should be visible in calendar', async() => {
        await pages.reservationPage.fillTheReservationForm('Browar Miesczanski', 'Zespol', reservation.bandName, reservation.phone, String(reservation.startHour), String(endHour), reservation.date);

        reservationDate = await pages.reservationPage.startDateInputValue;
        currentPrice = await pages.reservationPage.getCashReservationPrice();

        await pages.reservationPage.submitWithCashPayment();
        await pages.phoneConfirmationPage.enterUserReservationCode();
        await pages.phoneConfirmationPage.confirmReservation();
        await expect(pages.reservationPage.successfulReservationAlert).toBeVisible();
        await pages.reservationPage.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName, true, false);
    });

    await test.step('After login to admin panel, reservation should be visible as well', async() => {
        await page.goto('/#admin');
        await page.reload();
        await pages.adminLoginPage.loginTheUser(adminPassword);
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
        await pages.adminReservationPage.selectReservationScope('Anulowane');
        await expect(await pages.adminReservationPage.calendar.getAdminReservationElement(reservationDate, reservation.startHour, reservation.bandName)).not.toBeVisible();
    });

    await test.step('After filtering reservations by phone number, only reservations with correct number should be displayed', async() => {
        await pages.adminReservationPage.selectReservationScope('Aktywne');
        await pages.adminReservationPage.filterReservationByPhoneNum(fakePhoneNum);
        await expect(await pages.adminReservationPage.calendar.getAdminReservationElement(reservationDate, reservation.startHour, reservation.bandName)).not.toBeVisible();

        await pages.adminReservationPage.filterReservationByPhoneNum(reservation.phone);
        await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, reservation.startHour, reservation.bandName, true);
    });

    await test.step('When reservation is canceled, its preview should disappear - except canceled reservations view', async() => {
        await pages.adminReservationPage.calendar.clickToSeeReservationDetails(reservationDate, reservation.startHour, reservation.bandName);
        await pages.adminReservationDetailsPage.cancelReservation();
        await expect(await pages.adminReservationPage.calendar.getAdminReservationElement(reservationDate, reservation.startHour, reservation.bandName)).not.toBeVisible();

        await pages.adminReservationPage.selectReservationScope('Anulowane');
        await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, reservation.startHour, reservation.bandName, true);
    });

    await test.step('After filtering in canceled reservation view, only reservations with correct number should be displayed too', async() => {
        await pages.adminReservationPage.filterReservationByPhoneNum(fakePhoneNum);
        await expect(await pages.adminReservationPage.calendar.getAdminReservationElement(reservationDate, reservation.startHour, reservation.bandName)).not.toBeVisible();

        await pages.adminReservationPage.filterReservationByPhoneNum(reservation.phone);
        await pages.adminReservationPage.calendar.expectReservationToBeVisible(reservationDate, reservation.startHour, reservation.bandName, true);
    });
});