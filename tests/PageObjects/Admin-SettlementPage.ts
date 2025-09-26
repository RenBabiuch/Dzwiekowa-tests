import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import exp = require("node:constants");

type filterNameType = 'Sala' | 'Zespół' | 'Telefon' | 'Czas rezerwacji' | 'Typ rezerwacji' | 'Płatność' | 'Kwota' | 'Opłacone' | 'Komentarz' | 'Status';

export class AdminSettlementPagePO {
    constructor(private page: Page) {
    }

    header = new AdminHeader(this.page);

    public get headerElement() {
        return this.page.getByText('Rozliczenia rezerwacji');
    }

    tableHeaderElement = this.page.locator('.MuiTableHead-root');
    tableReservationRowElementSelector = '.MuiTableRow-root';

    public getTableColumnHeader(headerName: 'Sala' | 'Zespół' | 'Telefon' | 'Czas rezerwacji' | 'Typ rezerwacji' | 'Płatność' | 'Kwota' | 'Opłacone' | 'Komentarz' | 'Status' | 'Actions') {

        const headerNameToIndexMap = {
            'Sala': '0',
            'Zespół': '1',
            'Telefon': '2',
            'Czas rezerwacji': '3',
            'Typ rezerwacji': '4',
            'Płatność': '5',
            'Kwota': '6',
            'Opłacone': '7',
            'Komentarz': '8',
            'Status': '9',
            'Actions': '10',
        } as const;

        return this.tableHeaderElement.locator(`[data-index="${headerNameToIndexMap[headerName]}"]`);
    }

    public async getReservationRowByBandName(bandName: string) {
        const allRowElements = await this.page.locator(this.tableReservationRowElementSelector).all();

        for (const rowElement of allRowElements) {
            let rowElementText = await rowElement.innerText();
            if (rowElementText.includes(bandName)) {
                const reservationRowIndex = await rowElement.getAttribute('data-index');
                return this.page.locator(this.tableReservationRowElementSelector + '[data-index="' + reservationRowIndex + '"]');
            }
        }
    }

    public async expectReservationCostToHaveValue(bandName: string, expectedCost: string) {
        const reservationRowIndex = await this.getReservationRowByBandName(bandName);
        await expect(reservationRowIndex.locator('[data-index="6"]')).toHaveText(expectedCost);
    }










    public get filtersButton() {
        return this.page.getByLabel('Show/Hide filters');
    }

   public filterNameInput(filterName: filterNameType) {
        return this.page.locator(`input[title = "Filter by ${filterName}"]`);
   }

    public async clickToFilterBy(filterName: filterNameType) {
        await this.filtersButton.click();
        await expect(this.filterNameInput(filterName)).toBeVisible();
    }

    public async clickToHideFilter() {
        await this.filtersButton.click();
        await expect(this.page.locator('input[title^="Filter by"]').first()).toBeHidden();
    }

    public async filterReservationsBy(filterName: filterNameType, searchingWord: string) {
        await this.clickToFilterBy(filterName)
        await this.filterNameInput(filterName).fill(searchingWord);
    }
}