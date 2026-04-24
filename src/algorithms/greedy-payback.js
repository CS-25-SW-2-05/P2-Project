import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";
import WaitDecision from "./decisions/wait-decision.js";
import Objective from "./objective.js";

export default class ShortestPaybackAfterPurchase extends Algorithm {
    // Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
    static dummy = Algorithm.derived.add({
        name: this.name,
        title: "[Greedy] Shortest Payback (After Purchase)",
        instance: new ShortestPaybackAfterPurchase(),
    });

	/**
	 * @param {GameState} game the current game state
	 * @param {Building} buildings a list of all buildings, in their current state
	 * @param {Objective} objective
	 * @returns {Decision} the next decision to be performed, if it is valid.
	 */
	getNextDecision(gameState, buildings, objective) {
		// --- Fixed-time objectives handled first ---

		// Maximise CpS by end of time limit: buy the building with the best CpS per cookie spent
		if (objective.type === "fixed-production") {
			const timeLeft = objective.value - gameState.simulationTime;
			let bestBuilding = null;
			let bestEfficiency = -Infinity;

			for (const key in buildings) {
				const building = buildings[key];
				const saveUp = building.cost / gameState.cps;
				if (saveUp > timeLeft) continue;
				const efficiency = building.baseCpS / building.cost;
				if (efficiency > bestEfficiency) {
					bestEfficiency = efficiency;
					bestBuilding = building;
				}
			}
			if (bestBuilding === null) {
				console.log("Decision (fixed-production, Payback): wait");
				return new WaitDecision(gameState, Math.ceil(timeLeft));
			}
			console.log("Decision (fixed-production, Payback): " + bestBuilding.name);
			return new PurchaseDecision(gameState, bestBuilding);
		}

		// Maximise total cookies by end of time limit: only buy if the building pays back its cost before timer runs out, else wait
		if (objective.type === "fixed-cookies") {
			const timeLeft = objective.value - gameState.simulationTime;

			let bestBuilding = null;
			let bestProfit = -Infinity;

			for (const key in buildings) {
				const building = buildings[key];
				const saveUp = building.cost / gameState.cps;
				if (saveUp > timeLeft) continue;
				const profit = building.baseCpS * timeLeft - building.cost;
				if (profit > bestProfit) {
					bestProfit = profit;
					bestBuilding = building;
				}
			}
			// No building turns a profit → just wait out the time
			if (bestBuilding === null || bestProfit <= 0) {
				console.log("Decision (fixed-cookies, Payback): wait");
				return new WaitDecision(gameState, Math.ceil(timeLeft));
			}
			console.log("Decision (fixed-cookies, Payback): " + bestBuilding.name);
			return new PurchaseDecision(gameState, bestBuilding);
		}

		// --- Standard objectives: pure payback logic ---

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

		if (objective.type === "production") {
			console.log("Decision: " + bestDecision.buildingKey);
			console.log("Payback + wait time: " + bestDecision.paybackTime + "s");
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
