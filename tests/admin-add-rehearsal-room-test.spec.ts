import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>
test.beforeEach(async({page}) => {
    pages = initialise(page);
});

test('Adding new rehearsal room works', async({page}) => {

    await test.step('Go to the Manage Rooms', async() => {
        await page.goto('#admin');
        await pages.adminLoginPage.loginTheUser();
        await pages.adminReservationPage.adminHeader.goToManageRooms();
    });

    await test.step('All created rooms as well as new-room container should be visible', async() => {
        await expect(pages.adminManageRoomsPage.getRoomContainer('Browar')).toBeVisible();
        await expect(pages.adminManageRoomsPage.getRoomContainer('Młyn')).toBeVisible();
        await expect(pages.adminManageRoomsPage.getRoomContainer('Tęczowa 57')).toBeVisible();
        await expect(pages.adminManageRoomsPage.newRoomContainer).toBeVisible();
    });

    await pages.adminManageRoomsPage.enterRoomName('add new', 'New Sounds');
    await pages.adminManageRoomsPage.enterRoomAddress('add new', 'ul. Grecka 22-23');
    await pages.adminManageRoomsPage.selectRoomColor('add new');
    await pages.adminManageRoomsPage.enterRoomKey('add new', 'weeeeell');
    await pages.adminManageRoomsPage.enterRoomConfirmationMessage('add new', 'otwørzcie sobie dzrwi');

    await pages.adminManageRoomsPage.configureReservationType('add new', 'Solo', 'Solo_MessageKey', 'checked');
    await pages.adminManageRoomsPage.configureReservationType('add new', 'Nagrywka', 'Nagrywka_MessageKey', 'checked');
    await pages.adminManageRoomsPage.configureReservationType('add new', 'Zespół', 'Zespół_MessageKey', 'checked');
    await pages.adminManageRoomsPage.configureReservationType('add new', 'Solo z talerzami', 'Solo z talerzami_MessageKey', 'unchecked');
    await pages.adminManageRoomsPage.configureReservationType('add new', 'Lekcja/Duet', 'Lekcja/Duet_MessageKey', 'unchecked');
    await pages.adminManageRoomsPage.configureReservationType('add new', 'Próba 5+więcej', 'Próba 5+więcej_MessageKey', 'unchecked');
});