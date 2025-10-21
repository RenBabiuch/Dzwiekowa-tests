export function removeSpacesFromPhoneNumberIfNeeded(phoneNumber: string) {
    if(phoneNumber.includes(' ')) {
        // @ts-ignore
        return phoneNumber.replaceAll(' ', '');
    } else {
        return phoneNumber;
    }
}