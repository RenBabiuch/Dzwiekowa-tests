import initialise from "./PageObjects/initialise";
import {expect, test} from "@playwright/test";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async({page}) => {
    pages = initialise(page);

    await page.goto('#admin');
    await pages.adminLoginPage.loginTheUser();
});

test.describe('Filters tests', async () => {

    // The payment-type selector has been tested in the payment-test already

    test('Reservation-type selector works', async ({page}) => {
        const userInfo = {
            date: await pages.adminReservationPage.reservationForm.getSpecificDate('tomorrow'),
            startHour: await pages.adminReservationPage.reservationForm.generateRandomHour(),
        } as const;

        const endHour = userInfo.startHour + 2;

        const reservation1 = {
            bandName: 'Blow',
            phoneNumber: await pages.adminReservationPage.reservationForm.generateRandomPhoneNumber(),
        } as const;

        const reservation2 = {
            bandName: 'Henry_12',
            phoneNumber: await pages.adminReservationPage.reservationForm.generateRandomPhoneNumber(),
        } as const;

        const reservation3 = {
            bandName: 'Hungry Wolfs',
            phoneNumber: await pages.adminReservationPage.reservationForm.generateRandomPhoneNumber(),
        } as const;

        let reservationDate: string;

        test.slow();

        await test.step('Create three different reservations for the same hour', async() => {
            await pages.adminReservationPage.reservationForm.enterDataToTheReservationForm('Browar Miesczanski', 'Solo', reservation1.bandName, reservation1.phoneNumber, userInfo.startHour, endHour, userInfo.date);

            reservationDate = await pages.adminReservationPage.reservationForm.getStartDateInputValue();

            await pages.adminReservationPage.reservationForm.submitWithCashPayment();
            await expect(pages.adminReservationPage.reservationForm.successfulReservationAlert).toBeVisible();
            await pages.adminReservationPage.reservationForm.expectReservationToBeCreated(reservationDate, userInfo.startHour, reservation1.bandName, true, true);

            await pages.adminReservationPage.reservationForm.enterDataToTheReservationForm('Stary Mlyn', 'Nagrywka', reservation2.bandName, reservation2.phoneNumber, userInfo.startHour, endHour, userInfo.date);
            await pages.adminReservationPage.reservationForm.submitWithCashPayment();
            await pages.adminReservationPage.reservationForm.expectReservationToBeCreated(reservationDate, userInfo.startHour, reservation2.bandName, true, true);

            await pages.adminReservationPage.reservationForm.enterDataToTheReservationForm('Tęczowa 57', 'Zespół', reservation3.bandName, reservation3.phoneNumber, userInfo.startHour, endHour, userInfo.date);
            await pages.adminReservationPage.reservationForm.submitWithCashPayment();
            await pages.adminReservationPage.reservationForm.expectReservationToBeCreated(reservationDate, userInfo.startHour, reservation3.bandName, true, true);
        });

        await test.step('When reservationType is selected, only relevant reservations should be displayed', async() => {
            await page.reload();
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