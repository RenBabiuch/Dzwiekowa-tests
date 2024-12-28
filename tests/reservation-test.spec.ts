import {expect, test} from "@playwright/test";
import initialise from "./PageObjects/initialise";


let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({page}) => {
    pages = initialise(page);

    await page.goto('/');
});

const successfulMessage = 'Rezerwacja zapisana pomyślnie. Na podany numer telefonu otrzymasz potwierdzenie, a zaraz przed próbą wyślemy kod do drzwi.';

test.describe('Cash reservation tests', async () => {

    test('Successful reservation with correct data', async () => {

        const reservationInfo = {
            roomName: 'Stary Mlyn',
            type: 'Zespol',
            bandName: 'Chleb i Kawa',
            phoneNum: await pages.reservationPage.generateRandomPhoneNumber(),
            date: await pages.reservationPage.getTomorrowDate(),
            hour: {
                start: '9',
                end: '10'
            }
        } as const;

        await test.step('Fill the form with correct data', async () => {
            await pages.reservationPage.selectRehearsalRoom(reservationInfo.roomName);
            await pages.reservationPage.selectReservationType(reservationInfo.type);
            await pages.reservationPage.enterBandName(reservationInfo.bandName);
            await pages.reservationPage.enterPhoneNumber(reservationInfo.phoneNum);
            await pages.reservationPage.enterReservationDate(reservationInfo.date);
            await pages.reservationPage.selectReservationTime(reservationInfo.hour.start, reservationInfo.hour.end);
            await pages.reservationPage.expectSelectedTimeToBe(reservationInfo.hour.start, reservationInfo.hour.end);
        });

        await test.step('Select the checkbox and send the form', async () => {
            await pages.reservationPage.selectAgreementCheckbox();
            await pages.reservationPage.submitAndSelectCashPayment();
        });

        await test.step('After entering correct reservation code - the reservation should be created properly', async () => {
            await pages.bookingConfirmationPage.expectEnteredNumberToBeVisible(reservationInfo.phoneNum);
            await pages.bookingConfirmationPage.enterUserReservationCode();
            await pages.bookingConfirmationPage.confirmReservation();
            await expect(pages.reservationPage.successfulReservationAlert).toBeVisible();
            await expect(pages.reservationPage.successfulReservationAlert).toHaveText(successfulMessage);
        });
    });
});