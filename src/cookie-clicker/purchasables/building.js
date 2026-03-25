import Purchasable from "./purchasable.js";

class Building extends Purchasable {
	baseCost = 0;
	baseCpS = 0;
	maxBuildCount = 0;
	owned = 0;

	constructor(name, baseCost, baseCpS, maxBuildCount) {
		super(name, baseCost);

		this.baseCost = baseCost;
		this.baseCpS = baseCpS;
		this.maxBuildCount = maxBuildCount;
	}

	calcCost() {
		return Math.ceil(this.baseCost * 1.15 ** this.owned);
	}

	canPurchase() {
		return this.owned < this.maxBuildCount;
	}

	onPurchase() {
		this.owned++;
	}
}

async function getBuildingData() {
	try {
		const res = await fetch("./cookie-clicker/buildings.json");

		if (!res.ok) throw new Error(`Failed to load file: ${response.status}`);

		const jsonData = await res.json();
		return jsonData;
	} catch (error) {
		console.error("Error reading JSON file:", error);
		throw error;
	}
}

export const Buildings = {};
export async function loadBuildings() {
	const data = await getBuildingData();

	for (const [key, value] of Object.entries(data)) {
		Buildings[key] = new Building(
			key,
			value.baseCost,
			value.baseCpS,
			value.maxBuildCount,
		);
	}
}

export function cloneBuildings() {
	const copy = {};
	for (const [key, b] of Object.entries(Buildings)) {
		const inst = new Building(b.name, b.baseCost, b.baseCpS, b.maxBuildCount);
		inst.owned = b.owned;
		copy[key] = inst;
	}
	return copy;
}
