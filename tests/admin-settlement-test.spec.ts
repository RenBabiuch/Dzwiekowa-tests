import initialise from "./PageObjects/initialise";
import {expect, test} from "@playwright/test";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async({page}) => {
    pages = initialise(page);
});

test.beforeEach('Go to the Admin Panel', async({page}) => {
    await page.goto('#admin');
    await pages.adminLoginPage.loginTheUser();
});

test('Calculate-reservation-cost checkbox works', async({page}) => {

    const userInfo = {
        bandName: 'The_Newest',
        phoneNumber: await pages.adminReservationPage.reservationForm.generateRandomPhoneNumber(),
        date: await pages.adminReservationPage.reservationForm.getSpecificDate('tomorrow'),
        startHour: await pages.adminReservationPage.reservationForm.generateRandomHour(),
    } as const;

    const endHour = userInfo.startHour + 5;
    let startDate = '';
    const reservationCost = '0zł'

    test.slow();

    await test.step('Make a cash reservation with unchecked calculate-reservation-cost checkbox', async() => {
        await pages.adminReservationPage.reservationForm.enterDataToTheReservationForm('Stary Mlyn', 'Nagrywka', userInfo.bandName, userInfo.phoneNumber, userInfo.startHour, endHour, userInfo.date);
        startDate = await pages.adminReservationPage.reservationForm.getStartDateInputValue();
        await pages.adminReservationPage.expectCheckboxElementToBeVisible('calculateReservationCost');
        await pages.adminReservationPage.ensureCheckboxIsUnchecked('calculateReservationCost');
        await pages.adminReservationPage.submitWithCashPayment();
        await pages.adminReservationPage.expectReservationToBeCreated(startDate, userInfo.startHour, userInfo.bandName);
    });

    await test.step('Reservation cost should be = 0zł and visible in reservation details view', async() => {
        await page.reload();
        await pages.adminReservationPage.calendar.clickToSeeReservationDetails(startDate, userInfo.startHour, userInfo.bandName);
        await pages.adminReservationDetailsPage.expectReservationPriceToBe(reservationCost);
        await pages.adminReservationDetailsPage.closeReservationDetails();
    });

    await test.step('Go to SettlementPage and filter by bandName - reservation cost should be = 0zł ', async() => {
        await pages.adminReservationPage.adminHeader.goToSettlement();
        await expect(pages.adminSettlementPage.headerElement).toBeVisible();
        await expect(pages.adminSettlementPage.tableHeaderElement).toBeVisible();

        await pages.adminSettlementPage.filterReservationsBy('Zespół', userInfo.bandName);
        await expect(await pages.adminSettlementPage.getReservationRowByBandName(userInfo.bandName)).toBeVisible();
        await pages.adminSettlementPage.expectReservationParameterToHaveValue(userInfo.bandName, 'Zespół', userInfo.bandName);
        await pages.adminSettlementPage.expectReservationParameterToHaveValue(userInfo.bandName, 'Telefon', userInfo.phoneNumber);
        await pages.adminSettlementPage.expectReservationParameterToHaveValue(userInfo.bandName, 'Czas rezerwacji', startDate, userInfo.startHour, endHour);
        await pages.adminSettlementPage.expectReservationParameterToHaveValue(userInfo.bandName, 'Płatność', 'Gotówka');
        await pages.adminSettlementPage.expectReservationParameterToHaveValue(userInfo.bandName, 'Kwota', reservationCost);
        await pages.adminSettlementPage.expectReservationParameterToHaveValue(userInfo.bandName, 'Opłacone', '0');
    });

    await test.step('The reservation cost should be included in the monthly band`s settlement', async() => {
        await expect(pages.adminSettlementPage.getRoomSettlementElement('Młyn')).toBeVisible();
        await pages.adminSettlementPage.expectMonthlyBandSettlementToHaveValue('Młyn', 'Gotówka', 'Zapłacone: ', reservationCost);
        await pages.adminSettlementPage.expectMonthlyBandSettlementToHaveValue('Młyn', 'Gotówka', 'Do zapłaty: ', reservationCost);
    });
});