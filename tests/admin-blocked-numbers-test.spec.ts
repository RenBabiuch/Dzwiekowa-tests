import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
let reservation: {date: Date; bandName: string; startHour: number};
test.beforeEach(async ({page}) => {
    pages = initialise(page)

    await test.step('Log in to the admin panel', async() => {
    const adminPassword = '123456';

     reservation = {
        bandName: 'Timanfaya',
        date: await pages.reservationPage.getSpecificDate('tomorrow'),
        startHour: await pages.reservationPage.generateRandomHour(),
    } as const;

        await page.goto('/#admin');
        await pages.adminLoginPage.loginTheUser(adminPassword);
    });
});

    const blockedNumber = '519959288';

test('Complete blocking phone numbers works', async({page}) => {

    const reasonForBlocking = 'Zniszczenie instrumentów';
    const phoneNumErrorMessage = 'Ten numer ma zablokowaną opcję dodawania rezerwacji. Skontaktuj się z nami w celu wyjaśnienia sprawy';
    let reservationDate;
    const endHour =  reservation.startHour + 2;

    await test.step('Go to block the phone number of the problematic user', async() => {
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
        await pages.reservationPage.fillTheReservationForm('Browar Miesczanski', 'Zespół', reservation.bandName, blockedNumber, reservation.startHour, endHour, reservation.date);
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
        await pages.reservationPage.fillTheReservationForm('Browar Miesczanski', 'Zespół', reservation.bandName, blockedNumber, reservation.startHour, endHour, reservation.date);
        reservationDate = await pages.reservationPage.getStartDateValue();
        await pages.reservationPage.submitWithCashPayment();
        await pages.reservationPage.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName, true);
    });
});

test('Blocking phone number to cash payment works', async({page}) => {

    const endHour =  reservation.startHour + 1;
    const reasonForBlocking = 'lack of last cash payment';
    let reservationDate;
    const phoneNumErrorMessage = 'Ten numer ma zablokowaną opcję płatności gotówką. Użyj opcji płatności online lub skontaktuj się z nami w celu wyjaśnienia sprawy';

    await test.step('Go to block cash payments for the problematic user`s phone number', async() => {
        await pages.adminReservationPage.adminHeader.goToBlockNumbers();
        await pages.adminBlockedNumbersPage.fillTheBlockNumberForm(blockedNumber, 'enforce-online-payment', reasonForBlocking);
        await pages.adminBlockedNumbersPage.confirmNumberBlocking();
        await expect(await pages.adminBlockedNumbersPage.blockedNumberElement(blockedNumber)).toBeVisible();
    });

    await test.step('Go to create reservation with cash payment - the phone number error message should appear', async() => {
        await page.goto('/');
        await page.reload();
        await pages.reservationPage.fillTheReservationForm('Stary Mlyn', 'Nagrywka', reservation.bandName, blockedNumber, reservation.startHour, endHour, reservation.date);
        await pages.reservationPage.submitWithCashPayment();
        await pages.reservationPage.expectPhoneNumErrorMessageToBe(phoneNumErrorMessage);
    });

    await test.step('After unblocking the number, it should be possible to create a reservation with cash payment', async() => {
        await page.goto('/#admin');
        await page.reload();
        await pages.adminReservationPage.adminHeader.goToBlockNumbers();
        await expect(await pages.adminBlockedNumbersPage.blockedNumberElement(blockedNumber)).toBeVisible();
        await pages.adminBlockedNumbersPage.unlockPhoneNumber(blockedNumber);
        await expect(await pages.adminBlockedNumbersPage.blockedNumberElement(blockedNumber)).not.toBeVisible();

        await page.goto('/');
        await page.reload();
        await pages.reservationPage.fillTheReservationForm('Stary Mlyn', 'Nagrywka', reservation.bandName, blockedNumber, reservation.startHour, endHour, reservation.date);
        reservationDate = await pages.reservationPage.getStartDateValue();
        await pages.reservationPage.submitWithCashPayment();
        await pages.reservationPage.expectReservationToBeCreated(reservationDate, reservation.startHour, reservation.bandName, true);
    });
});