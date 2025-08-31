import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async({page}) => {
   pages = initialise(page);

   await page.goto('/#admin');
});

test('Successful log in with correct data', async() => {
   const password = '123456';

   await test.step('After logging in, admin panel with correct data should appear', async() => {
      await pages.adminLoginPage.loginTheUser(password);
      await expect(pages.adminReservationPage.adminHeader.loggedToAdminPanelInfo).toBeVisible();
      await expect(pages.adminReservationPage.calendarElement).toBeVisible();
      await pages.adminReservationPage.adminHeader.goToManageRooms();
      await expect(pages.adminManageRoomsPage.getRoomContainer('Browar')).toBeVisible();
      await expect(pages.adminManageRoomsPage.getRoomContainer('Stary Młyn')).toBeVisible();
   });
});

test('Unsuccessful log in with incorrect data ', async() => {
   const password = '123admin';

   await test.step('After logging in, admin panel without any data should appear', async() => {
      await pages.adminLoginPage.loginTheUser(password);
      await expect(pages.adminReservationPage.adminHeader.loggedToAdminPanelInfo).toBeVisible();
      await pages.adminReservationPage.adminHeader.goToManageRooms();
      await expect(pages.adminManageRoomsPage.getRoomContainer('Browar')).not.toBeVisible();
      await expect(pages.adminManageRoomsPage.getRoomContainer('Stary Młyn')).not.toBeVisible();
   });
});