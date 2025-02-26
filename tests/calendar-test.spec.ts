import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";


let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({page}) => {
    pages = initialise(page);

    await page.goto('/');
});

test('The calendar shows the correct dates', async () => {

    const todayDate = pages.reservationPage.calendar.generateTodayDate;
    let previousWeekSaturdayDate = "";
    let currentWeekMondayDate = "";
    let currentWeekSundayDate = "";
    let nextWeekFridayDate = "";

    await test.step('Ensure today`s day has properly date and it`s visible in the calendar', async () => {
        await pages.reservationPage.calendar.expectToShowCorrectDateIndicatedAsToday();
        await expect(pages.reservationPage.calendar.getDayElement(todayDate)).toBeVisible();
    });

    await test.step('The week date range should include 2 dates: Monday - Sunday', async () => {

        currentWeekMondayDate = await pages.reservationPage.calendar.getDateByWeekDay('Mon');
        currentWeekSundayDate = await pages.reservationPage.calendar.getDateByWeekDay('Sun');

        await pages.reservationPage.calendar.expectDateToBeVisibleInWeekDateRange(currentWeekMondayDate);
        await pages.reservationPage.calendar.expectDateToBeVisibleInWeekDateRange(currentWeekSundayDate);
    });

    await test.step('Go to the next week - only next week dates should be visible', async () => {
        await pages.reservationPage.calendar.goToNextWeek();
        await expect(pages.reservationPage.calendar.getDayElement(todayDate)).not.toBeVisible();
        await expect(pages.reservationPage.calendar.getDayElement(currentWeekMondayDate)).not.toBeVisible();

        nextWeekFridayDate = await pages.reservationPage.calendar.getDateByWeekDay('Fri');
        await expect(pages.reservationPage.calendar.getDayElement(nextWeekFridayDate)).toBeVisible();
    });

    await test.step('Go back to the current week - only current week dates should be visible now', async () => {
        await pages.reservationPage.calendar.goToPreviousWeek();
        await expect(pages.reservationPage.calendar.getDayElement(currentWeekMondayDate)).toBeVisible();
        await expect(pages.reservationPage.calendar.getDayElement(nextWeekFridayDate)).not.toBeVisible();
    });

    await test.step('Go to the previous week - the week ago dates should be visible on calendar', async () => {
        await pages.reservationPage.calendar.goToPreviousWeek();
        previousWeekSaturdayDate = await pages.reservationPage.calendar.getDateByWeekDay('Sat');

        await expect(pages.reservationPage.calendar.getDayElement(previousWeekSaturdayDate)).toBeVisible();
        await expect(pages.reservationPage.calendar.getDayElement(todayDate)).not.toBeVisible();
    });

    await test.step('After clicking on the currentButton, the current week should appear in the calendar', async () => {
        await pages.reservationPage.calendar.showCurrentWeek();
        await expect(pages.reservationPage.calendar.getDayElement(todayDate)).toBeVisible();
        await expect(pages.reservationPage.calendar.getDayElement(previousWeekSaturdayDate)).not.toBeVisible();
        await expect(pages.reservationPage.calendar.getDayElement(nextWeekFridayDate)).not.toBeVisible();
    });
});
