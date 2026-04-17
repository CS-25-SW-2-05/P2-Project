import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";
import WaitDecision from "./decisions/wait-decision.js";

export default class GreedyPaybackTime extends Algorithm {
	// Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: "[Greedy] Shortest Payback (+ Save-up)",
		instance: new GreedyPaybackTime(),
	});

	/**
	 * @param {GameState} game the current game state
	 * @param {Building} buildings a list of all buildings, in their current state
	 * @returns {Decision} the next decision to be performed, if it is valid.
	 */
	getNextDecision(gameState, buildings, objective) {
		//console.log(buildings);
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

		// If the objective is CpS then WaitDecision is ignored
		if (objective.type !== "cookies") {
			console.log("Decision: " + bestDecision[0]);
			console.log("Payback + save up time: " + bestDecision[1] + "s");
			return new PurchaseDecision(gameState, buildings[bestDecision[0]]);
		}

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
