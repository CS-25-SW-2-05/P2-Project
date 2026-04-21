export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getPlural = (str, amount) => str + (amount === 1 ? "" : "s");

export const round = (value, decimals) => {
    const divisor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * divisor) / divisor;
};

export function remap(value, srcMin, srcMax, destMin, destMax) {
    return (
        ((value - srcMin) / (srcMax - srcMin)) * (destMax - destMin) + destMin
    );
}

export const yieldFrame = () => new Promise((r) => requestAnimationFrame(r));

export function formatTime(s) {
    const secondsInMinute = 60;
    const secondsInHour = secondsInMinute * 60;
    const secondsInDay = secondsInHour * 24;
    const secondsInWeek = secondsInDay * 7;
    const secondsInYear = secondsInDay * 365.25;
    const secondsInMonth = secondsInYear / 12;

    let remaining = s;
    const years = Math.floor(remaining / secondsInYear);
    remaining -= years * secondsInYear;
    const months = Math.floor(remaining / secondsInMonth);
    remaining -= months * secondsInMonth;
    const weeks = Math.floor(remaining / secondsInWeek);
    remaining -= weeks * secondsInWeek;
    const days = Math.floor(remaining / secondsInDay);
    remaining -= days * secondsInDay;
    const hours = Math.floor(remaining / secondsInHour);
    remaining -= hours * secondsInHour;
    const minutes = Math.floor(remaining / secondsInMinute);
    remaining -= minutes * secondsInMinute;
    const seconds = Math.floor(remaining);

    return `${years} years ${months} months ${weeks} weeks ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
}

export function formatLabel(str) {
    return (
        str
            // Tilføj paranteser omkring "After Purchase" i "ShortestPaybackAfterPurchase"
            .replace("AfterPurchase", " (After Purchase)")
            // Tilføj paranteser omkring "After Purchase" i "ShortestPaybackAfterPurchase"
            .replace("PlusSaveup", " (+Save-up)")
            // snake_case -> mellemrum
            .replace(/_/g, " ")
            // camelCase -> mellemrum
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            // lowercase alt først
            .toLowerCase()
            // Capitalize hvert ord
            .replace(/\b\w/g, (char) => char.toUpperCase())
    );
}
