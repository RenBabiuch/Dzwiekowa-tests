import initialise from "./PageObjects/initialise";
import {expect, test} from "@playwright/test";

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({page}) => {
    pages = initialise(page);

    await page.goto('#admin');
    await pages.adminLoginPage.loginTheUser();
});

test('Successful adding - new and next one - note', async () => {

    const note1 = 'I just added my first note on Dzwiekowa! Such a nice thing!';
    const note2 = 'I forgot to add - rock&roll !!!';

    await test.step('After adding the note, it should be saved correctly', async () => {
        await pages.adminReservationPage.adminHeader.goToNotepad();
        await expect(pages.adminNotepadPage.headerElement).toBeVisible();
        await expect(pages.adminNotepadPage.noteTextArea).toBeVisible();
        await expect(pages.adminNotepadPage.saveButton).toBeDisabled();
        await pages.adminNotepadPage.addAndSaveNote(note1);
        await pages.adminNotepadPage.expectNoteToBeSaved(note1);
    });

    await test.step('After changing the module and returning - the note should be visible', async () => {
        await pages.adminNotepadPage.adminHeader.goToManageReservations();
        await pages.adminReservationPage.adminHeader.goToNotepad();
        await pages.adminNotepadPage.expectNotepadToContainText(note1);
    });

    await test.step('After logging out and logging back in, the note still should be visible in the relevant admin panel', async () => {
        await pages.adminNotepadPage.adminHeader.logoutTheUser();
        await pages.adminLoginPage.loginTheUser();
        await pages.adminNotepadPage.expectNotepadToContainText(note1);
    });

    await test.step('The user should be able to add another note to the existing one - both should be visible', async () => {
        await pages.adminNotepadPage.addAndSaveNote(note2);
        await pages.adminNotepadPage.expectNotepadToContainText(note1);
        await pages.adminNotepadPage.expectNotepadToContainText(note2);
    });

    await test.step('After deleting note, textarea should be empty', async() => {
        await pages.adminNotepadPage.deleteNote();
        await expect(pages.adminNotepadPage.noteTextArea).toBeEmpty({timeout: 5_000});
    });
});