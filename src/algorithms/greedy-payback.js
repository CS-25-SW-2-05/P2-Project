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
        tooltip:
            "Purchases the building which has the fastest time to pay itself back.",
        instance: new ShortestPaybackAfterPurchase(),
    });

    getNextDecision(gameState, objective, buildings) {
        let paybackTime = 0;
        let numOfBuildingsAssessed = 0;
        let timeLeft = 0;

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

        // If objective is fixed horizon, filter out buildings
        // that we cannot save up for within the remaining time
        // to ensure that the algorithm doesnt choose to buy these
        if (
            objective.type === "fixed-time-cookies" ||
            objective.type === "fixed-time-production"
        ) {
            // Array to store buildings that can be bought
            const filteredBuildings = {};

            // Calculate remaining time until target time
            timeLeft = objective.value - gameState.simulationTime;

            for (const key in buildings) {
                const building = buildings[key];

                // Calculate time to save up for building
                const saveUpTime =
                    (building.cost - gameState.cookies) / gameState.cps;

                // If save up time is shorter, add it to filtered buildings
                if (saveUpTime <= timeLeft) {
                    filteredBuildings[key] = building;
                }
            }

            // If no more buildings can be afforded before time target,
            // just wait
            if (Object.keys(filteredBuildings).length === 0) {
                return new WaitDecision(gameState, Math.ceil(timeLeft));
            }

            // Update the buildings object
            buildings = filteredBuildings;
        }

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

        // Get best decision building object
        const bestDecisionBuilding = buildings[bestDecision.buildingKey];
        const waitTime = objective.value / gameState.cps;

        console.log("Wait:", waitTime);
        console.log("Payback:", bestDecision.paybackTime);

        if (
            objective.type === "production" ||
            objective.type === "fixed-time-production"
        ) {
            console.log("Decision: " + bestDecision.buildingKey);
            console.log(
                "Payback + wait time: " + bestDecision.paybackTime + "s",
            );
            return new PurchaseDecision(
                gameState,
                buildings[bestDecision.buildingKey],
            );
        }

        // Cookies objective: wait if it's faster than buying
        if (objective.type === "cookies") {
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

        // Cookies [fixed horizon]: Wait, if it gains more cookies at time target
        if (objective.type === "fixed-time-cookies") {
            // Calculate cookies earned at time target by waiting
            const cookiesFromWaiting =
                gameState.cookies + gameState.cps * timeLeft;
            console.log("Cookies from waiting: ", cookiesFromWaiting);

            //Calculate saveup time for best building
            const bestSaveUpTime =
                (bestDecisionBuilding.cost - gameState.cookies) / gameState.cps;

            // Calculate the extra production from building
            const cookiesGainedFromBuying =
                (timeLeft - bestSaveUpTime) * bestDecisionBuilding.baseCpS;

            // Calculate cookies earned at time target from buying
            // the building with the shortest payback + saveup time
            const cookiesFromBuying =
                cookiesFromWaiting -
                bestDecisionBuilding.cost +
                cookiesGainedFromBuying;
            console.log("Cookies from buying: ", cookiesFromBuying);

            if (cookiesFromWaiting >= cookiesFromBuying) {
                return new WaitDecision(gameState, Math.ceil(timeLeft));
            } else {
                return new PurchaseDecision(gameState, bestDecisionBuilding);
            }
        }
    }
}
