import {Page} from "@playwright/test";
import {PaymentMethodMenu} from "../components/payment-method-menu";

export class TransferPagePO {
    constructor(private page: Page) {
    }

    paymentMethodMenu = new PaymentMethodMenu(this.page);

    public get bankIngElement() {
        return this.page.getByAltText('Płać z ING');
    }

    public async selectIngBankTransfer() {
        await this.bankIngElement.click();
    }
}