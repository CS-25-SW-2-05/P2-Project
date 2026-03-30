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
		//console.log(buildings);
		let bestDecision = ["cursor", 0];
		let tempDecision = ["cursor", 0];
		let currentCPS = gameState.cps + gameState.manualCpS;
        //console.log(currentCPS);

		// just to make sure there are no dividing by 0 shenanigans
		if (currentCPS == 0){
			currentCPS += 6;
		}

		let saveUpTime = 0;
		let paybackTime = 0;
		let paybackSaveUpTime = 0;
		let numOfBuildingsAssessed = 0;


		/* 
		paybackSaveUpTime is calculated for every building, 
		and the building with the lowest time is found
		and sent to the new Decision function thing
		*/
		for(let key in buildings){
			paybackTime = buildings[key].cost/buildings[key].baseCpS;
			
			saveUpTime = buildings[key].cost/currentCPS;

			paybackSaveUpTime = saveUpTime + paybackTime;

			tempDecision = [key, paybackSaveUpTime];

			if(numOfBuildingsAssessed == 0){
				bestDecision[0] = tempDecision[0];

				bestDecision[1] = tempDecision[1];

				numOfBuildingsAssessed++;

				continue;
			}

			if(tempDecision[1] <= bestDecision[1]){
				bestDecision[0] = tempDecision[0];

				bestDecision[1] = tempDecision[1];
				
			}

			numOfBuildingsAssessed++;
		}

		return new Decision(gameState, buildings[bestDecision[0]]);
	}
}
