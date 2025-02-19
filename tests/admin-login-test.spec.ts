import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async({page}) => {
   pages = initialise(page);
});

test('Admin log in to the platform works', async({page}) => {
   const password = '123admin';

   await test.step('After log in, admin manage panel with calendar should be visible', async() => {
      await page.goto('/#admin');
      await pages.adminLoginPage.loginTheUser(password);
      await expect(pages.adminManagePanelPage.manageAdminPanelInfo).toBeVisible();
      await expect(pages.adminManagePanelPage.calendarElement).toBeVisible();
   });
});