import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";
import WaitDecision from "./decisions/wait-decision.js";

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
	getNextDecision(gameState, buildings, objective) {

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

		//Logging the result building
		console.log(
			"Cheapest building:    " +
			String(cheapestBuilding.name));

		// Buy cheapest building, if the objective is production
		if (objective.type == "production")
			return new PurchaseDecision(gameState, cheapestBuilding);

		// Calculate time to reach objective without buying
		let waitTimeWithoutBuying = (objective.value - gameState.cookies) / gameState.cps

		// Calculate time to afford cheapest building
		let timeToAfford = 0;

		if (gameState.cookies < cheapestPrice) {
			timeToAfford = (cheapestPrice - gameState.cookies) / gameState.cps;
		}

		// Calculate cookies after buying
		let cookiesAfterBuy = gameState.cookies + gameState.cps * timeToAfford - cheapestPrice;

		// Calculate new CPS
		let newCps = gameState.cps + cheapestBuilding.baseCpS;

		// Calculate time to reach objective after buying building
		let timeAfterBuy = (objective.value - cookiesAfterBuy) / newCps;

		// Calculate overall time to reach objective when buying cheapest building
		let waitTimeWithBuying = timeToAfford + timeAfterBuy;

		console.log("Time without buy:", waitTimeWithoutBuying);
		console.log("Time with buy:", waitTimeWithBuying);

		if (waitTimeWithBuying < waitTimeWithoutBuying) {
			return new PurchaseDecision(gameState, cheapestBuilding);
		} else {
			return new WaitDecision(gameState, waitTimeWithoutBuying);
		}
	}
}