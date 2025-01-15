import {Page} from "@playwright/test";
import {ReservationPagePO} from "./ReservationPage";
import {PhoneConfirmationPagePO} from "./PhoneConfirmationPage";

export default function initialise(page: Page) {
    return{
        reservationPage: new ReservationPagePO(page),
        phoneConfirmationPage: new PhoneConfirmationPagePO(page),
    }
}