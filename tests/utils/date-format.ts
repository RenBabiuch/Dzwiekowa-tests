export function getFormattedDate(inputDate: string) {
    const day = inputDate.slice(8, 10);
    const month = inputDate.slice(5, 7);
    const year = inputDate.slice(0, 4);

    return `${day}/${month}/${year}`;
}