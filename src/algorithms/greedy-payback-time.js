import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";
import WaitDecision from "./decisions/wait-decision.js";

export default class GreedyPaybackTime extends Algorithm {
	// Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: "[Greedy] Save+Payback",
		instance: new GreedyPaybackTime(),
	});

	/**
	 * @param {GameState} game the current game state
	 * @param {Building} buildings a list of all buildings, in their current state
	 * @returns {Decision} the next decision to be performed, if it is valid.
	 */
	getNextDecision(gameState, buildings, objective) {
		// Fixed-time objectives handled first, be they were falling under the "!== cookies", which has also been changed.

		// maximise the cPs before timer runs out:
		if (objective.type === "fixed-production") {
			// Variables for "tracking" the best building (next purchase)
			let bestBuilding = null;
			let bestEfficiency = -Infinity; // Starts at -inf, so any positive value is greater

			for (const key in buildings) {
				const building = buildings[key];

				// efficiency calculates: how much CpS you GET divided by how much it COSTS

				//* Example:
				// cursor costs 15, gives 0.1 CpS ---> efficiency = 0.1/15 = 0.0067 */
				const efficiency = building.baseCpS / building.cost;
				// if this building is more effecient than the current best, replace it
				if (efficiency > bestEfficiency) {
					bestEfficiency = efficiency;
					bestBuilding = building;
				}
			}
			console.log("Decision (fixed-production): " + bestBuilding?.name);

			// Buy the most effecient building
			return new PurchaseDecision(gameState, bestBuilding);
		}

		// Maximise total cookies by the end of timer
		// SAME CONCEPT AS "fixed-production"
		if (objective.type === "fixed-cookies") {
			// quick calculation of how many seconds remain before the time limit ends, this is useful for calculating how many cookies a building will produce
			const timeLeft = objective.value - gameState.simulationTime;
			let bestBuilding = null;
			let bestProfit = -Infinity;

			for (const key in buildings) {
				const building = buildings[key];
				// How many cookies this building will produce before time runs out
				const cookiesEarned = building.baseCpS * timeLeft;
				// How many cookies we still need to save up to afford it
				// if there's enough cookie, saveUp = 0
				const saveUp = Math.max(0, building.cost - gameState.cookies);
				// what we earn from it minus what we still need to spend on it
				const profit = cookiesEarned - saveUp;
				//which ever building gives the highest profit.
				if (profit > bestProfit) {
					bestProfit = profit;
					bestBuilding = building;
				}
			}
			// No building turns a profit then  wait out the time
			if (bestBuilding === null || bestProfit <= 0) {
				console.log("Decision (fixed-cookies): wait");
				return new WaitDecision(gameState, Math.ceil(timeLeft));
			}
			console.log("Decision (fixed-cookies): " + bestBuilding.name);
			return new PurchaseDecision(gameState, bestBuilding);
		}

		// Standard objectives: save-up + payback logic

		let bestDecision = ["cursor", 0];
		let tempDecision = ["cursor", 0];
		let saveUpTime = 0;
		let paybackTime = 0;
		let paybackSaveUpTime = 0;
		let numOfBuildingsAssessed = 0;
		/*
		paybackSaveUpTime is calculated for every building,
		and the building with the lowest time is found
		and sent to the new Decision function thing
		*/
		for (let key in buildings) {
			paybackTime = buildings[key].cost / buildings[key].baseCpS;
			saveUpTime = (buildings[key].cost - gameState.cookies) / gameState.cps;
			paybackSaveUpTime = saveUpTime + paybackTime;
			tempDecision = [key, paybackSaveUpTime];

			if (numOfBuildingsAssessed == 0) {
				bestDecision[0] = tempDecision[0];
				bestDecision[1] = tempDecision[1];
				numOfBuildingsAssessed++;
				continue;
			}

			if (tempDecision[1] <= bestDecision[1]) {
				bestDecision[0] = tempDecision[0];
				bestDecision[1] = tempDecision[1];
			}
			numOfBuildingsAssessed++;
		}

		// If the objective is production then WaitDecision is ignored
		if (objective.type === "production") {
			console.log("Decision: " + bestDecision[0]);
			console.log("Payback + save up time: " + bestDecision[1] + "s");
			return new PurchaseDecision(gameState, buildings[bestDecision[0]]);
		}

		// Cookies objective: wait if it's faster than buying
		const waitSaveUpTime =
			(objective.value - gameState.cookies) / gameState.cps;

		if (waitSaveUpTime <= bestDecision[1]) {
			console.log("Decision: wait");
			console.log("Wait time: " + waitSaveUpTime + "s");
			return new WaitDecision(gameState, Math.ceil(waitSaveUpTime));
		}

		console.log("Decision: " + bestDecision[0]);
		console.log("Payback + save up time: " + bestDecision[1] + "s");
		return new PurchaseDecision(gameState, buildings[bestDecision[0]]);
	}
}
