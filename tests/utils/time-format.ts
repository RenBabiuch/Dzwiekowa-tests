export function getFormattedHours(startHour: number, endHour?: number) {
    const formattedStartHour = String(startHour).padStart(2, '0');
    const formattedEndHour = String(endHour).padStart(2, '0');

    if(endHour) {
        return `${formattedStartHour}:00-${formattedEndHour}:00`;
    } else {
        return `${formattedStartHour}:00`;
    }
}

