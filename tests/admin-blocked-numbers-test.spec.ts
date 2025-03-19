import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({page}) => {
    pages = initialise(page)

    await page.goto('/#admin');
});

test('Complete blocking phone numbers works', async({page}) => {

    const adminPassword = '12345';
    const blockedNumber = '519959288';
    const reasonForBlocking = 'Zniszczenie instrumentów';

    const reservation = {
        bandName: 'Timanfaya',
        date: await pages.reservationPage.getSpecificDate('tomorrow'),
        startHour: await pages.reservationPage.generateRandomHour(),
    } as const;

    const endHour = reservation.startHour + 2;
    const phoneNumErrorMessage = 'Ten numer ma zablokowaną opcję dodawania rezerwacji. Skontaktuj się z nami w celu wyjaśnienia sprawy';
    let reservationDate;

    await test.step('Go to admin panel to block the phone number of the problematic user', async() => {
        await pages.adminLoginPage.loginTheUser(adminPassword);
        await pages.adminReservationPage.adminHeader.goToBlockNumbers();
        await pages.adminBlockedNumbersPage.enterNumberToBlock(blockedNumber);
        await pages.adminBlockedNumbersPage.selectBlockType('blocked');
        await pages.adminBlockedNumbersPage.enterBlockNumberReason(reasonForBlocking)
        await pages.adminBlockedNumbersPage.confirmNumberBlocking();
        await expect(pages.adminBlockedNumbersPage.blockedNumbersContainer).toBeVisible();
        await expect(await pages.adminBlockedNumbersPage.blockedNumberElement(blockedNumber)).toBeVisible();
    });

    await test.step('Go to create reservation with blocked number - the phone number error message should appear', async() => {
        await page.goto('/');
        await page.reload();
        await pages.reservationPage.fillTheReservationForm('Browar Miesczanski', 'Zespol', reservation.bandName, blockedNumber, reservation.startHour, endHour, reservation.date);
        await pages.reservationPage.submitWithCashPayment();
        await pages.reservationPage.expectPhoneNumErrorMessageToBe(phoneNumErrorMessage);
    });

    await test.step('After unblocking the number, it should be possible to create a reservation', async() => {
        await page.goto('/#admin');
        await page.reload();
        await pages.adminReservationPage.adminHeader.goToBlockNumbers();
        await expect(await pages.adminBlockedNumbersPage.blockedNumberElement(blockedNumber)).toBeVisible();
        await pages.adminBlockedNumbersPage.unlockPhoneNumber(blockedNumber);
        await expect(await pages.adminBlockedNumbersPage.blockedNumberElement(blockedNumber)).not.toBeVisible();

        await page.goto('/');
        await page.reload();
        await pages.reservationPage.fillTheReservationForm('Browar Miesczanski', 'Zespol', reservation.bandName, blockedNumber, reservation.startHour, endHour, reservation.date);
        reservationDate = await pages.reservationPage.startDateInput.getAttribute('value');
        await pages.reservationPage.submitWithCashPayment();
        await pages.reservationPage.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName, true);
    });
});