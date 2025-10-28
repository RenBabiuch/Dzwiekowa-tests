import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>
test.beforeEach(async({page}) => {
    pages = initialise(page);

});

test('Adding new rehearsal room works', async({page}) => {

    // const password = 'new-room';

    // await pages.adminLoginPage.loginTheUser(password);
    await page.goto('#admin');
    await pages.adminLoginPage.loginTheUser();
    await pages.adminReservationPage.adminHeader.goToManageRooms();
    await expect(pages.adminManageRoomsPage.getRoomContainer('Browar')).toBeVisible();
    await expect(pages.adminManageRoomsPage.getRoomContainer('Młyn')).toBeVisible();
    await expect(pages.adminManageRoomsPage.getRoomContainer('Tęczowa 57')).toBeVisible();
    await expect(pages.adminManageRoomsPage.newRoomContainer).toBeVisible();
    await pages.adminManageRoomsPage.enterRoomName('New Sounds');
    await pages.adminManageRoomsPage.enterRoomAddress('ul. Grecka 22-23');
    await pages.adminManageRoomsPage.selectRoomColor();
    await pages.adminManageRoomsPage.roomConfirmationTextInput.fill('otwørzcie sobie dzrwi');
    await expect(pages.adminManageRoomsPage.getSMSBeforeStartReservationInput('Solo')).toBeVisible();
    await expect(await pages.adminManageRoomsPage.getSMSBeforeStartReservationInput('Nagrywka')).toBeVisible();
    await expect(await pages.adminManageRoomsPage.getSMSBeforeStartReservationInput('Solo z talerzami')).toBeVisible();
    await expect(await pages.adminManageRoomsPage.getSMSBeforeStartReservationInput('Zespół')).toBeVisible();
    await expect(await pages.adminManageRoomsPage.getSMSBeforeStartReservationInput('Lekcja/Duet')).toBeVisible();
    await expect(await pages.adminManageRoomsPage.getSMSBeforeStartReservationInput('Próba 5+więcej')).toBeVisible();

    await expect(pages.adminManageRoomsPage.reservationTypeToggle('Solo')).toBeVisible();
    await expect(pages.adminManageRoomsPage.reservationTypeToggle('Nagrywka')).toBeVisible();
    await expect(pages.adminManageRoomsPage.reservationTypeToggle('Solo z talerzami')).toBeVisible();
    await expect(pages.adminManageRoomsPage.reservationTypeToggle('Zespół')).toBeVisible();
    await expect(pages.adminManageRoomsPage.reservationTypeToggle('Lekcja/Duet')).toBeVisible();
    await expect(pages.adminManageRoomsPage.reservationTypeToggle('Próba 5+więcej')).toBeVisible();
    await page.pause();
    await pages.adminManageRoomsPage.ensureCheckboxToBeChecked('Solo');
    await pages.adminManageRoomsPage.ensureCheckboxToBeChecked('Zespół');
    await pages.adminManageRoomsPage.ensureCheckboxToBeChecked('Próba 5+więcej');
    await pages.adminManageRoomsPage.ensureCheckboxToBeChecked('Nagrywka');
    await pages.adminManageRoomsPage.ensureCheckboxToBeChecked('Lekcja/Duet');
    await pages.adminManageRoomsPage.ensureCheckboxToBeChecked('Solo z talerzami');
    await pages.adminManageRoomsPage.clickSubmitButtonToAddRehearsalRoom();

});

