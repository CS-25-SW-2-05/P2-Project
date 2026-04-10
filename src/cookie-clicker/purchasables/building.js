import { round } from "../../utils.js";
import GameState from "../game-state.js";
import Purchasable from "./purchasable.js";

export default class Building extends Purchasable {
	baseCost = 0;
	baseCpS = 0;
	maxBuildCount = 0;
	owned = 0;

	/**
	 * @param {string} name the name of the building.
	 * @param {number} baseCost the base cost of the building.
	 * @param {number} baseCpS the CpS increase per owned building.
	 * @param {number} maxBuildCount the max amount of ownable buildings.
	 */
	constructor(name, baseCost, baseCpS, maxBuildCount) {
		super(name, baseCost);

		this.baseCost = baseCost;
		this.baseCpS = baseCpS;
		this.maxBuildCount = maxBuildCount;
	}

	updateCost() {
		this.cost = Math.ceil(this.baseCost * 1.15 ** this.owned);
	}

	/**
	 * @override false if next building exceeds maxBuildCount.
	 */
	canPurchase() {
		return this.owned < this.maxBuildCount;
	}

	/**
	 * Abstract method which is called right before the game state updates.
	 * @param {GameState} gameState the current game state.
	 * @override adds a building and updates CpS.
	 */
	onPurchase(gameState) {
		this.owned++;
		gameState.buildingCpS = round(gameState.buildingCpS + this.baseCpS, 1);
	}
}

/**
 * Reads the 'src\cookie-clicker\buildings.json' file and parses the json data.
 * @returns the parsed json data.
 */
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

/**
 * A list of all available buildings loaded by the loadBuildings function. \
 * This list should not be mutated. To mutate, please make a clone.
 */
export const Buildings = {};

/**
 * Loads all buildings found in 'src\\cookie-clicker\\buildings.json' into the Buildings list.
 */
export async function loadBuildings(length = -1) {
	const data = await getBuildingData();

	for (var key in Buildings) delete Buildings[key];

	let i = 0;
	for (const [key, value] of Object.entries(data)) {
		if (length !== -1 && i >= length) {
			console.log("Building Length:", Buildings.length);
			return;
		}
		Buildings[key] = new Building(
			key,
			value.baseCost,
			value.baseCpS,
			value.maxBuildCount,
		);
		i++;
	}
}

/**
 * Will log all building stats available in the the the array to the console.
 * @param {Building[]} buildings buildings to log.
 */
export function logBuildingStats(buildings) {
	//Output building stats
	for (const key in buildings) {
		const currentBuilding = buildings[key];

		// Logging current building prices
		console.log(
			currentBuilding.name.padEnd(15) +
				" price: " +
				String(currentBuilding.cost).padEnd(25) +
				" owned: " +
				currentBuilding.owned,
		);
	}
}

/**
 * Clone the Buildings list for possible later mutation.
 * @returns {Building[]} a clone of Buildings, which can be mutated.
 */
export function cloneBuildings() {
	const copy = {};
	for (const [key, b] of Object.entries(Buildings)) {
		const inst = new Building(b.name, b.baseCost, b.baseCpS, b.maxBuildCount);
		inst.owned = b.owned;
		copy[key] = inst;
	}

	return copy;
}

/**
 * Filter Buildings list for buildings that have reached max level
 * or price of infinity
 * @param {*} buildings The list to be filtered
 * @returns The filtered list of buildings
 */
export function filterValid(buildings) {
	const filteredBuildings = {};

	// Iterate over the building list using the the key and the objects
	for (const [key, building] of Object.entries(buildings)) {
		// Add the building to the list, if it can be purchased
		if (building.canPurchase() && Number.isFinite(building.cost))
			filteredBuildings[key] = building;
	}

	return filteredBuildings;
}
