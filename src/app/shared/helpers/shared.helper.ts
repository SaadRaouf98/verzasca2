export function mapTo(path: string, source: any, allowUndefined = false, allowArrayWithSingleValue = false): any {
    let toBeReturned: any;
    if (source) {
        const attributes: string[] = path.split('.');
        toBeReturned = source[attributes[0]];
        for (let i = 1; i < attributes.length && toBeReturned != null; i++) toBeReturned = toBeReturned[attributes[i]];
    }


    // Check if the value is a valid date
    if (toBeReturned instanceof Date) {
        return toBeReturned;
    }

    // Return null for undefined or missing date values
    if (toBeReturned === undefined || toBeReturned === null) {
        return allowUndefined ? toBeReturned : null;
    }

    // Return '-' for other missing values
    let toReturn = toBeReturned || toBeReturned === 0 ? toBeReturned : '-';


    // // to make sure that if the returned data is undefined, we will override it by -
    // let toReturn = toBeReturned || toBeReturned === 0 ? toBeReturned : allowUndefined ? toBeReturned : '-';

    if (Array.isArray(toReturn) && toReturn.length == 1 && !allowArrayWithSingleValue) {
        toReturn = toReturn[0];
    }

    return toReturn;
}


export function removeTimeFromDate(dateString: string): string {
    if (dateString)
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
    return dateString;
}
