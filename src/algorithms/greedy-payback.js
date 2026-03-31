import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

export default class GreedyPayback extends Algorithm {
	// Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: "[Greedy] Payback",
		instance: new GreedyPayback(),
	});

	/**
	 * @param {GameState} game the current game state
	 * @param {Building} buildings a list of all buildings, in their current state
	 * @returns {Decision} the next decision to be performed, if it is valid.
	 */
	getNextDecision(gameState, buildings) {
		// implementer "Dum" payback greedy algoritme, erstat "buildings["cursor"]" herunder
		             
    let paybackTime = 0;                   
    let numOfBuildingsAssessed = 0;   

    let bestDecision = {
        buildingKey: "cursor",
        paybackTime: Infinity
    }
    let tempDecision = {
        buildingKey: "cursor",
        paybackTime: 0
    }

    for (let key in buildings) {

      
        let b = buildings[key];

        if (!b.canPurchase()) continue;

        let cost = b.cost;

    
        let gain = b.baseCps;

  
        if (gain <= 0) continue;

        paybackTime = cost / gain;

        tempDecision[0] = key;
        tempDecision[1] = paybackTime;


        if (numOfBuildingsAssessed === 0) {
            bestDecision[0] = tempDecision[0];
            bestDecision[1] = tempDecision[1];
            numOfBuildingsAssessed++;
            continue;
        }

   
        if (tempDecision[1] < bestDecision[1]) {
            bestDecision[0] = tempDecision[0];
            bestDecision[1] = tempDecision[1];
        }

        numOfBuildingsAssessed++;
    }


		return new Decision(gameState,buildings[bestDecision[0]]);
	}
}
