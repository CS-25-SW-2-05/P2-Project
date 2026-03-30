import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

export default class GreedyNaive extends Algorithm {
	// Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: "[Greedy] Immediate Purchase",
		instance: new GreedyNaive(),
	});

	/**
	 * @param {GameState} game the current game state
	 * @param {Building} buildings a list of all buildings, in their current state
	 * @returns {Decision} the next decision to be performed, if it is valid.
	 */
	getNextDecision(gameState, buildings) {

		let cheapestBuilding = null;
		let cheapestPrice = Infinity;

		// Looping through buildings in buildings
		for (const key in buildings) {
			const building = buildings[key];

			// Update cheapest building and cheapest building price
			if (building.calcCost() < cheapestPrice) {
				cheapestBuilding = building;
				cheapestPrice = building.calcCost();
			}
		}

		//Logging the resultet building
		console.log(
			"Cheapest building:    " +
			String(cheapestBuilding.name));

		return new Decision(gameState, cheapestBuilding);
	}
}