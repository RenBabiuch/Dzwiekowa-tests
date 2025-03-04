import {Page} from "@playwright/test";

type roomNameType = 'Browar Miesczanski' | 'Stary Młyn';

export class AdminManageRoomsPagePO {
    constructor(private page: Page) {
    }

    public getRoomContainer(roomName: roomNameType) {
        return this.page.getByTestId(`room-${roomName}`);
    }
}