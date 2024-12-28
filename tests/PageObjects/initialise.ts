import {Page} from "@playwright/test";
import {ReservationPagePO} from "./ReservationPage";
import {BookingConfirmationPagePO} from "./BookingConfirmationPage";

export default function initialise(page: Page) {
    return{
        reservationPage: new ReservationPagePO(page),
        bookingConfirmationPage: new BookingConfirmationPagePO(page),
    }
}