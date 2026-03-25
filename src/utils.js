export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getPlural = (str, amount) => str + (amount === 1 ? "" : "s");

export const round = (value, decimals) => {
	const divisor = 10 ** decimals;
	return Math.round(value * divisor) / divisor;
};
