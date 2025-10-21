import {expect, Page} from "@playwright/test";
import {AdminHeader} from "../components/admin-header";
import {getFormattedDate} from "../utils/date-format";
import {getFormattedHours} from "../utils/time-format";

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

type headerNameType = keyof typeof headerNameToIndexMap;

type roomNameType = 'Browar' | 'Młyn' | 'Tęczowa 57';
type roomSettlementType = roomNameType | 'Całość';

export class AdminSettlementPagePO {
    constructor(private page: Page) {
    }

    header = new AdminHeader(this.page);

    tableHeaderElement = this.page.locator('.MuiTableHead-root');
    tableReservationRowElementSelector = 'tr.MuiTableRow-root[data-index]';
    filteredResultsContainerSelector = '.MuiTableBody-root';
    settlementElement = this.page.locator('.flex-col.gap-8');

    public get headerElement() {
        return this.page.getByText('Rozliczenia rezerwacji');
    }

    public getTableColumnHeader(headerName: headerNameType) {
        return this.tableHeaderElement.locator(`[data-index="${headerNameToIndexMap[headerName]}"]`);
    }

    public async getReservationRow(bandName: string) {
        const allRowElements = await this.page.locator(this.tableReservationRowElementSelector).all();

        for (let rowElement of allRowElements) {
            let rowElementText = await rowElement.innerText();
            if (rowElementText.includes(bandName)) {
                const reservationRowIndex = await rowElement.getAttribute('data-index');
                return this.page.locator(this.tableReservationRowElementSelector + '[data-index="' + reservationRowIndex + '"]');
            }
        }
    }

    public async getFilteredReservationRow(bandName: string, date: string, startHour: number, phoneNumber: string) {
        await this.filterReservationsBy('Zespół', bandName);
        await expect(this.page.locator(this.filteredResultsContainerSelector)).toBeVisible();
        const filteredBandReservationRowSelector = `${this.filteredResultsContainerSelector} tr`;

        const formattedDate = getFormattedDate(date);
        const formattedStartHour = getFormattedHours(startHour);

        const bandReservations = await this.page.locator(filteredBandReservationRowSelector).all();

        for(let bandReservation of bandReservations) {
        await expect(bandReservation).toContainText(bandName);
            let bandReservationText = await bandReservation.innerText();
                if (bandReservationText.includes(`${formattedDate}, ${formattedStartHour}`)) {
                    await expect(bandReservation).toContainText(`${formattedDate}, ${formattedStartHour}`);
                    await expect(bandReservation).toContainText(`+48 ${phoneNumber}`);
                    const reservationRowIndex = await bandReservation.getAttribute('data-index');
                    return this.page.locator(`${filteredBandReservationRowSelector}[data-index="${reservationRowIndex}"]`);
                } else {
                    console.log('Found results: Reservation doesn\'t exist');
            }
        }
    }

    public async expectReservationParameterToHaveValue(bandName: string, reservationParameter: headerNameType, expectedValue: string, startHour?: number, endHour?: number) {
        const reservationRowIndex = await this.getReservationRow(bandName);

        if (reservationParameter === 'Telefon') {
            await expect(reservationRowIndex.locator(`[data-index="${headerNameToIndexMap[reservationParameter]}"]`)).toHaveText(`+48 ${expectedValue}`);
        } else if (reservationParameter === 'Czas rezerwacji') {
            const formattedDate = getFormattedDate(expectedValue);
            const formattedStartAndEndHours = getFormattedHours(startHour, endHour);

            await expect(reservationRowIndex.locator(`[data-index="${headerNameToIndexMap[reservationParameter]}"]`)).toContainText(`${formattedDate}, ${formattedStartAndEndHours}`);
        } else if (reservationParameter === 'Opłacone') {
            await expect(reservationRowIndex.locator(`[data-index="${headerNameToIndexMap[reservationParameter]}"] input`)).toHaveValue(expectedValue);
        } else if (reservationParameter === 'Status') {
            await expect(reservationRowIndex.locator(`[data-index="${headerNameToIndexMap[reservationParameter]}"] input`)).toHaveValue(expectedValue);
        } else {
            await expect(reservationRowIndex.locator(`[data-index="${headerNameToIndexMap[reservationParameter]}"]`)).toHaveText(expectedValue);
        }
    }

    public get filtersButton() {
        return this.page.getByLabel('Show/Hide filters');
    }

    public filterNameInput(filterName: headerNameType) {
        return this.page.locator(`input[title = "Filter by ${filterName}"]`);
    }

    public async clickToFilterBy(filterName: headerNameType) {
        await this.filtersButton.click();
        await expect(this.filterNameInput(filterName)).toBeVisible();
    }

    public async clickToHideFilter() {
        await this.filtersButton.click();
        await expect(this.page.locator('input[title^="Filter by"]').first()).toBeHidden();
    }

    public async filterReservationsBy(filterName: headerNameType, searchingWord: string) {
        await this.clickToFilterBy(filterName)
        await this.filterNameInput(filterName).fill(searchingWord);
        await this.expectFilterIconToBeVisible(filterName);
    }

    public async expectFilterIconToBeVisible(filterName: headerNameType) {
        await expect(this.page.locator(`[aria-label ^="Filtering by ${filterName}"]`)).toBeVisible();
    }

    public getRoomSettlementElement(roomName: roomSettlementType) {
        return this.settlementElement.getByText(roomName);
    }

    public async expectMonthlyBandSettlementToHaveValue(roomName: roomSettlementType, paymentType: 'Online' | 'Gotówka', paymentStatus: 'Do zapłaty: ' | 'Zapłacone: ', expectedValue: string) {

        const allPaymentTypesForRoomElement = this.getRoomSettlementElement(roomName).locator('+ div.flex.gap-4');
        const selectedPaymentTypeForRoomElement = allPaymentTypesForRoomElement.getByText(paymentType);
        const selectedPaymentStatus = selectedPaymentTypeForRoomElement.getByText(paymentStatus);

        await expect(allPaymentTypesForRoomElement).toBeVisible();
        await expect(selectedPaymentTypeForRoomElement).toBeVisible();
        await expect(selectedPaymentStatus).toBeVisible();

        if (paymentStatus === 'Do zapłaty: ') {
            const currentPaymentStatus = selectedPaymentTypeForRoomElement.locator('div').first();
            await expect(currentPaymentStatus).toContainText(`${paymentStatus}${expectedValue}`);
        } else if (paymentStatus === 'Zapłacone: ') {
            const currentPaymentStatus = selectedPaymentTypeForRoomElement.locator('div').last();
            await expect(currentPaymentStatus).toContainText(`${paymentStatus}${expectedValue}`);
        }
    }

    public get blockNumberButton() {
        return this.page.locator('a').getByText('Zablokuj');
    }

    public async goToBlockNumber(bandName: string, date: string, startHour: number, phoneNumber: string) {
        const foundReservation = await this.getFilteredReservationRow(bandName, date, startHour, phoneNumber);
        await foundReservation.locator(this.blockNumberButton).click();
    }

    public async expectReservationToBeVisibleWithBlockedNumber(bandName: string, date: string, startHour: number, phoneNumber: string) {
        const foundReservation = await this.getFilteredReservationRow(bandName, date, startHour, phoneNumber);
        await expect(foundReservation.locator(this.blockNumberButton)).toHaveAttribute('aria-disabled', 'true');
    }
}
