import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";

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
	getNextDecision(gameState, buildings, objective) {
		// implementer "Dum" payback greedy algoritme, erstat "buildings["cursor"]" herunder
		             
    let paybackTime = 0;                   
    let numOfBuildingsAssessed = 0;   

    let bestDecision = {
        buildingKey: "cursor",
        paybackTime: 0
    }
    let tempDecision = {
        buildingKey: "cursor",
        paybackTime: 0
    }

    for (let key in buildings) {

      
        let b = buildings[key];

        //if (!b.canPurchase()) continue;

        let cost = b.cost;
console.log(cost);
    
        let gain = b.baseCpS;

  console.log(gain);
        if (gain <= 0) continue;

        paybackTime = cost / gain;
        console.log(paybackTime);

        tempDecision.buildingKey = key;
        tempDecision.paybackTime = paybackTime;


        if (numOfBuildingsAssessed === 0) {
            bestDecision.buildingKey = tempDecision.buildingKey;
            bestDecision.paybackTime = tempDecision.paybackTime;
            numOfBuildingsAssessed++;
            continue;
        }

   
        if (tempDecision.paybackTime < bestDecision.paybackTime) {
            bestDecision.buildingKey = tempDecision.buildingKey;
            bestDecision.paybackTime = tempDecision.paybackTime;
        }

        numOfBuildingsAssessed++;
    }


}
    