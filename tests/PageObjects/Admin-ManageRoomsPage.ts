import {Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";

type roomNameType = 'Browar Miesczanski' | 'Stary Młyn';

export class AdminManageRoomsPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);

    public getRoomContainer(roomName: roomNameType) {
        return this.page.getByTestId(`room-${roomName}`);
    }
}