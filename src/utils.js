export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getPlural = (str, amount) => str + (amount === 1 ? "" : "s");

export const round = (value, decimals) => {
	const divisor = 10 ** decimals;
	return Math.round((value + Number.EPSILON) * divisor) / divisor;
};

export function remap(value, srcMin, srcMax, destMin, destMax) {
	return ((value - srcMin) / (srcMax - srcMin)) * (destMax - destMin) + destMin;
}
