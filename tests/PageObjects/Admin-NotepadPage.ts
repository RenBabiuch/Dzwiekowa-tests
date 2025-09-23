import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";

export class AdminNotepadPagePO {
    constructor(private page: Page) {
    }

    adminHeader = new AdminHeader(this.page);

    notepadContainer = this.page.locator('.MuiPaper-rounded').first();

    public get headerElement() {
        return this.notepadContainer.getByText('Notatnik');
    }

    public get noteTextArea() {
        return this.page.getByPlaceholder('Wpisz tutaj swoje notatki...');
    }

    public get saveButton() {
        return this.page.getByRole('button', {name: 'Zapisz notatki'});
    }

    public async clickToSubmit() {
        await this.saveButton.click();
    }

    public async addNote(text: string) {
        await this.noteTextArea.click();
        const noteContent = await this.noteTextArea.textContent();

        if(noteContent.length === 0) {
            await this.noteTextArea.fill(text);
        } else {
            await this.page.keyboard.press('Enter');
            await this.page.keyboard.press('Enter');
            await this.noteTextArea.type(text);
        }
    }

    public async addAndSaveNote(text: string) {
        await this.addNote(text);
        await this.clickToSubmit();
    }

    public get savedNoteMarkElement() {
        return this.notepadContainer.locator('svg.text-green-700');
    }

    public async expectNoteToBeSaved(text: string) {
        await expect(this.noteTextArea).toContainText(text);
        await expect(this.savedNoteMarkElement).toBeVisible();
        await expect(this.saveButton).toBeDisabled();
    }

    public async expectNotepadToContainText(text: string) {
        await expect(this.noteTextArea).toContainText(text);
    }

    public async deleteNote() {
        await this.noteTextArea.clear();
        await this.clickToSubmit();
    }
}