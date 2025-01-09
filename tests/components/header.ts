import {Page} from "@playwright/test";

export class Header {
    constructor(private page: Page) {
    }

    public get weekDateElement() {
        return this.page.locator('√.fc-toolbar.fc-header-toolbar');
    }

}