import {Page} from "@playwright/test";

export class AdminNotepadPagePO {
    constructor(private page: Page) {
    }


    public get notepadHeaderElement() {
        return this.page.getByText('Notatnik', {exact: true})
    }


}

