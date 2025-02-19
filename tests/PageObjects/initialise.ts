import {Page} from "@playwright/test";
import {ReservationPagePO} from "./ReservationPage";
import {PhoneConfirmationPagePO} from "./PhoneConfirmationPage";
import {PrePaymentPagePO} from "./PrePaymentPage";
import {TransferPagePO} from "./TransferPage";
import {BankPagePO} from "./BankPage";
import {PaymentMethodMenu} from "../components/payment-method-menu";
import {AdminLoginPagePO} from "./Admin-LoginPage";
import {AdminManagePanelPagePO} from "./Admin-ManagePanelPage";

export default function initialise(page: Page) {
    return{
        reservationPage: new ReservationPagePO(page),
        phoneConfirmationPage: new PhoneConfirmationPagePO(page),
        prePaymentPage: new PrePaymentPagePO(page),
        transferPage: new TransferPagePO(page),
        paymentMethodMenu: new PaymentMethodMenu(page),
        bankPage: new BankPagePO(page),
        adminLoginPage: new AdminLoginPagePO(page),
        adminManagePanelPage: new AdminManagePanelPagePO(page)
    }
}