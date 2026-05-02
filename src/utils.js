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

export function formatTime(time, base) {
    // Support us and ms
    if (base === "ms") {
        if (time < 1000) return `${round(time, 1)}ms`;
        time = time / 1000;
    } else if (base === "us") {
        if (time < 1000) return `${round(time, 0)}µs`;
        if (time < 1_000_000) return `${round(time / 1000, 1)}ms`;
        time = time / 1_000_000;
    }

    const secondsInMinute = 60;
    const secondsInHour = secondsInMinute * 60;
    const secondsInDay = secondsInHour * 24;
    const secondsInWeek = secondsInDay * 7;
    const secondsInYear = secondsInDay * 365.25;
    const secondsInMonth = secondsInYear / 12;

    let remaining = time;
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
    const seconds = round(remaining, 2);

    // Collect time units in order from largest to smallest
    const units = [
        [years, "y"],
        [months, "mon"],
        [weeks, "w"],
        [days, "d"],
        [hours, "h"],
        [minutes, "m"],
        [seconds, "s"],
    ];

    const result = [];

    // Loop through units and collect the first two non-zero values
    for (const unit of units) {
        const value = unit[0];
        const label = unit[1];

        // Skip units with value 0
        if (value === 0) continue;

        result.push(value + "" + label);

        // Stop after collecting two units
        if (result.length === 2) break;
    }

    // If no units were added, return "0 seconds"
    return result.length > 0 ? result.join(" ") : "0 seconds";
}

export function formatLabel(str) {
    return (
        str
            // Format dum payback directly
            .replace(
                "ShortestPaybackAfterPurchase",
                "Shortest Payback (After Purchase)",
            )
            // Format smart payback directly
            .replace("ShortestPaybackPlusSaveUp", "Shortest Payback (+Save-up)")
            // snake_case -> space
            .replace(/_/g, " ")
            // camelCase -> space
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            // firstly, lowercase all
            .toLowerCase()
            // Capitalize every word
            .replace(/\b\w/g, (char) => char.toUpperCase())
    );
}

let toastCounter = 0;
/**
 * Show a toast in the lower-right corner of the screen.
 * @param {string} title title of the toast.
 * @param {string} msg message of the toast.
 */
export function toast(title, msg) {
    const toast = document.querySelector(".toast");
    const toastTitle = toast.querySelector("h2");
    const toastMsg = toast.querySelector("p");

    toastCounter++;
    toastTitle.textContent = title;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
        toastCounter--;
        if (toastCounter !== 0) return;
        toast.classList.remove("show");
    }, 4000);
}

export function safeDivide(numerator, denominator, fallback = 1) {
    return denominator === 0 || !Number.isFinite(denominator)
        ? fallback
        : numerator / denominator;
}
