import {Page} from "@playwright/test";
import {ReservationPagePO} from "./ReservationPage";
import {PhoneConfirmationPagePO} from "./PhoneConfirmationPage";
import {PrePaymentPagePO} from "./PrePaymentPage";
import {TransferPagePO} from "./TransferPage";
import {BankPagePO} from "./BankPage";
import {PaymentMethodMenu} from "../components/payment-method-menu";
import {AdminLoginPagePO} from "./Admin-LoginPage";
import {AdminReservationPagePO} from "./Admin-ReservationPage";
import {AdminManageRoomsPagePO} from "./Admin-ManageRoomsPage";
import {AdminReservationDetailsPagePO} from "./Admin-ReservationDetailsPage";
import {AdminBlockedNumbersPagePO} from "./Admin-BlockedNumbersPage";

export default function initialise(page: Page) {
    return{
        reservationPage: new ReservationPagePO(page),
        phoneConfirmationPage: new PhoneConfirmationPagePO(page),
        prePaymentPage: new PrePaymentPagePO(page),
        transferPage: new TransferPagePO(page),
        paymentMethodMenu: new PaymentMethodMenu(page),
        bankPage: new BankPagePO(page),
        adminLoginPage: new AdminLoginPagePO(page),
        adminReservationPage: new AdminReservationPagePO(page),
        adminManageRoomsPage: new AdminManageRoomsPagePO(page),
        adminReservationDetailsPage: new AdminReservationDetailsPagePO(page),
        adminBlockedNumbersPage: new AdminBlockedNumbersPagePO(page)
    }
}