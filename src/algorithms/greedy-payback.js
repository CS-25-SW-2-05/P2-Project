import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";
import WaitDecision from "./decisions/wait-decision.js";
import Objective from "./objective.js";

export default class ShortestPaybackAfterPurchase extends Algorithm {
    // Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
    static dummy = Algorithm.derived.add({
        name: this.name,
        title: "Shortest Payback (After Purchase)",
        instance: new ShortestPaybackAfterPurchase(),
    });

    /**
     * @param {GameState} game the current game state
     * @param {Building} buildings a list of all buildings, in their current state
     * @param {Objective} objective
     * @returns {Decision} the next decision to be performed, if it is valid.
     */
    getNextDecision(gameState, buildings, objective) {
        // implementer "Dum" payback greedy algoritme, erstat "buildings["cursor"]" herunder

        let paybackTime = 0;
        let numOfBuildingsAssessed = 0;

        let bestDecision = {
            buildingKey: "cursor",
            paybackTime: 0,
            cost: 0,
        };
        let tempDecision = {
            buildingKey: "cursor",
            paybackTime: 0,
            cost: 0,
        };

        for (let key in buildings) {
            let b = buildings[key];

            let cost = b.cost;
            let gain = b.baseCpS;

            if (gain <= 0) continue;

            paybackTime = cost / gain;

            tempDecision.buildingKey = key;
            tempDecision.paybackTime = paybackTime;
            tempDecision.cost = cost;

            if (numOfBuildingsAssessed === 0) {
                bestDecision.buildingKey = tempDecision.buildingKey;
                bestDecision.paybackTime = tempDecision.paybackTime;
                bestDecision.cost = tempDecision.cost;
                numOfBuildingsAssessed++;
                continue;
            }

            if (tempDecision.paybackTime < bestDecision.paybackTime) {
                bestDecision.buildingKey = tempDecision.buildingKey;
                bestDecision.paybackTime = tempDecision.paybackTime;
                bestDecision.cost = tempDecision.cost;
            }

            numOfBuildingsAssessed++;
        }

        const waitTime = objective.value / gameState.cps;

        console.log("Wait:", waitTime);
        console.log("Payback:", bestDecision.paybackTime);

        if (objective.type !== "cookies") {
            console.log("Decision: " + bestDecision.buildingKey);
            console.log(
                "Payback + wait time: " + bestDecision.paybackTime + "s",
            );
            return new PurchaseDecision(
                gameState,
                buildings[bestDecision.buildingKey],
            );
        }

        const shouldWait =
            waitTime <= bestDecision.paybackTime ||
            bestDecision.cost >= objective.value;

        if (!shouldWait) {
            console.log("Decision: " + bestDecision.buildingKey);
            console.log(
                "Payback + save up time: " + bestDecision.paybackTime + "s",
            );
            return new PurchaseDecision(
                gameState,
                buildings[bestDecision.buildingKey],
            );
        }

        console.log("Decision: wait");
        console.log("Wait time: " + waitTime + "s");
        return new WaitDecision(gameState, Math.ceil(waitTime));
    }
}
