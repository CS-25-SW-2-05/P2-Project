import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";
import WaitDecision from "./decisions/wait-decision.js";

export default class BuyCheapest extends Algorithm {
    // Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
    static dummy = Algorithm.derived.add({
        name: this.name,
        title: "[Greedy] Buy Cheapest",
        tooltip: "Purchases the cheapest building.",
        instance: new BuyCheapest(),
    });

    getNextDecision(gameState, objective, buildings) {
        let cheapestBuilding = null;
        let cheapestPrice = Infinity;

        // Looping through buildings in buildings
        for (const key in buildings) {
            const building = buildings[key];

            // Update cheapest building and cheapest building price
            const price = building.cost;
            if (price < cheapestPrice) {
                cheapestBuilding = building;
                cheapestPrice = price;
            }
        }

        //Logging the result building
        console.log("Cheapest building:    " + String(cheapestBuilding.name));

        // Buy cheapest building if the objective is production
        if (objective.type === "production")
            return new PurchaseDecision(gameState, cheapestBuilding);

        // Fixed-time objectives: buy the cheapest until the clock runs out,
        // then wait out the remaining time so simulationTime doesn't "overshoot".
        if (
            objective.type === "fixed-time-production" ||
            objective.type === "fixed-time-cookies"
        ) {
            const timeLeft = objective.value - gameState.simulationTime;
            const saveUp = cheapestBuilding.cost / gameState.cps;
            if (saveUp > timeLeft)
                return new WaitDecision(gameState, Math.ceil(timeLeft));
            return new PurchaseDecision(gameState, cheapestBuilding);
        }

        // Calculate cookies needed to reach objective
        const cookiesNeeded = Math.max(0, objective.value - gameState.cookies);

        // If the cookies needed to reach the objective is less than the cheapest building price
        if (cookiesNeeded <= cheapestPrice) {
            // Calculate time to reach objective
            const waitTime = cookiesNeeded / gameState.cps;

            // Wait until the objective is reached
            return new WaitDecision(gameState, Math.ceil(waitTime));
        }

        // Else buy the cheapest building
        return new PurchaseDecision(gameState, cheapestBuilding);
    }
}
