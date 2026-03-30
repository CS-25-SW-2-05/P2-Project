import { loadBuildings } from "../cookie-clicker/purchasables/building.js";
import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

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
	getNextDecision(gameState, buildings) {
		// implementer "smart" payback greedy algoritme, erstat "buildings["cursor"]" herunder

		let bestDecision = [buildings["cursor"], 0];
		let tempDecision = [buildings["cursor"], 0];
		let saveUpTime = 0;
		let paybackTime = 0;
		let paybackSaveUpTime = 0;
		console.log(buildings);

		for(let key in buildings){

			paybackTime = buildings[key].cost/buildings[key].baseCpS;
			saveUpTime = buildings[key].cost/gameState.cps;
			paybackSaveUpTime = saveUpTime + paybackTime;
			tempDecision = [buildings[key], paybackSaveUpTime];

			if(tempDecision[1] >= bestDecision[1]){
				bestDecision[0] = tempDecision[0];
				bestDecision[1] = tempDecision[1];
			}
		}
		console.log(bestDecision[0]);

		return new Decision(gameState, bestDecision[0]);
	}
}
