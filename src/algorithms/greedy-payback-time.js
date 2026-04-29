import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";
import WaitDecision from "./decisions/wait-decision.js";

export default class ShortestPaybackPlusSaveUp extends Algorithm {
    // Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
    static dummy = Algorithm.derived.add({
        name: this.name,
        title: "[Greedy] Shortest Payback (+Save-up)",
        tooltip:
            "Purchases the building which has the fastest time to afford and pay itself back.",
        instance: new ShortestPaybackPlusSaveUp(),
    });

    /**
     * @param {GameState} game the current game state
     * @param {Building} buildings a list of all buildings, in their current state
     * @returns {Decision} the next decision to be performed, if it is valid.
     */
    getNextDecision(gameState, buildings, objective) {
        let bestDecisionBuilding = buildings["cursor"];
        let bestPaybackSaveUpTime = 0;
        let tempBuilding = buildings["cursor"];
        let tempPaybackSaveUpTime = 0;
        let saveUpTime = 0;
        let bestSaveUpTime = 0;
        let paybackTime = 0;
        let paybackSaveUpTime = 0;
        let numOfBuildingsAssessed = 0;
        let timeLeft = 0;

        console.log("Buildings before filter:");
        console.log(buildings);

        // If objective is cookies [fixed horizon], filter out buildings
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

        console.log("Buildings after filter:");
        console.log(buildings);

        /*
        paybackSaveUpTime is calculated for every building,
        and the building with the lowest time is found
        and sent to the new Decision function thing
        */
        for (let key in buildings) {
            // Assigning current building in the loop
            const building = buildings[key];

            // Calculating payback time after purchase
            paybackTime = building.cost / building.baseCpS;

            // Calculating save up time
            saveUpTime = (building.cost - gameState.cookies) / gameState.cps;

            // Save up + payback after purchase
            paybackSaveUpTime = saveUpTime + paybackTime;

            // If it's the first building assessed, set it as the best option
            if (numOfBuildingsAssessed === 0) {
                bestDecisionBuilding = building;
                bestPaybackSaveUpTime = paybackSaveUpTime;
                bestSaveUpTime = saveUpTime;
                numOfBuildingsAssessed++;
                continue;
            }

            // If payback + save-up time of this building is better
            // than the current best, update the best decision
            if (paybackSaveUpTime <= bestPaybackSaveUpTime) {
                bestDecisionBuilding = building;
                bestPaybackSaveUpTime = paybackSaveUpTime;
                bestSaveUpTime = saveUpTime;
            }
            numOfBuildingsAssessed++;
        }

        console.log("Best building:");
        console.log(bestDecisionBuilding);

        // If the objective is production then WaitDecision is ignored
        if (
            objective.type === "production" ||
            objective.type === "fixed-time-production"
        ) {
            console.log("Decision: " + bestDecisionBuilding);
            console.log(
                "Payback + save up time: " + bestPaybackSaveUpTime + "s",
            );
            return new PurchaseDecision(gameState, bestDecisionBuilding);
        }

        // Cookies objective: wait if it's faster than buying
        if (objective.type === "cookies") {
            const waitSaveUpTime =
                (objective.value - gameState.cookies) / gameState.cps;

            if (waitSaveUpTime <= bestPaybackSaveUpTime) {
                console.log("Decision: wait");
                console.log("Wait time: " + waitSaveUpTime + "s");
                return new WaitDecision(gameState, Math.ceil(waitSaveUpTime));
            }

            console.log("Decision: " + bestDecisionBuilding);
            console.log(
                "Payback + save up time: " + bestPaybackSaveUpTime + "s",
            );
            return new PurchaseDecision(gameState, bestDecisionBuilding);
        }

        // Cookies [fixed horizon]: Wait, if it gains more cookies at time target
        if (objective.type === "fixed-time-cookies") {
            // Calculate cookies earned at time target by waiting
            const cookiesFromWaiting =
                gameState.cookies + gameState.cps * timeLeft;
            console.log("Cookies from waiting: ", cookiesFromWaiting);

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
