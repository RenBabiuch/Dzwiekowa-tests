import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async({page}) => {
    pages = initialise(page)
});

test('Log out the user works', async({page}) => {
    const password = '12345';

    await test.step('Go to log in - admin panel with correct data should appear', async() => {
        await page.goto('/#admin');
        await pages.adminLoginPage.loginTheUser(password);
        await expect(pages.adminReservationPage.adminHeader.loggedToAdminPanelInfo).toBeVisible();
        await pages.adminReservationPage.adminHeader.goToManageRooms();
        await expect(pages.adminManageRoomsPage.getRoomContainer('Browar Miesczanski')).toBeVisible();
    });

    await test.step('After logging out - the user should be redirected to the login page', async() => {
        await pages.adminManageRoomsPage.adminHeader.logoutTheUser();
        await expect(pages.adminManageRoomsPage.adminHeader.loggedToAdminPanelInfo).not.toBeVisible();
        await expect(pages.adminLoginPage.passwordInput).toBeVisible();
    });
});