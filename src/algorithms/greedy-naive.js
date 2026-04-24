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

    /**
     * @param {GameState} game the current game state
     * @param {Building} buildings a list of all buildings, in their current state
     * @returns {Decision} the next decision to be performed, if it is valid.
     */
    getNextDecision(gameState, buildings, objective) {
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

        // Buy cheapest building, if the objective is production
        if (objective.type === "production")
            return new PurchaseDecision(gameState, cheapestBuilding);

        // Calculate cookies needed to reach objective
        const cookiesNeeded = Math.max(0, objective.value - gameState.cookies);

        console.log(
            "Cookies needed for objective:",
            Math.round(cookiesNeeded),
            "cookies",
        );
        console.log(
            "Cookies needed for purchase:",
            Math.round(cheapestPrice),
            "cookies",
        );

        // If the cookies needed to reach the objective is less than the cheapest building price
        if (cookiesNeeded <= cheapestPrice) {
            // Calculate time to reach objective
            const waitTime = cookiesNeeded / gameState.cps;

            // Wait until the objective is reached
            return new WaitDecision(gameState, Math.ceil(waitTime));
        }

        // Else buy the cheapest building
        return new PurchaseDecision(gameState, cheapestBuilding);

        // 1 step look ahead:
        // If the time to objective is faster when buying the building,
        // buy the cheapest building, else wait until the objective is reached

        /*
		// Calculate time to reach objective without buying
		const waitTimeWithoutBuying =
			(objective.value - gameState.cookies) / gameState.cps;

		// Calculate time to afford cheapest building
		const timeToAfford =
			gameState.cookies < cheapestPrice
				? (cheapestPrice - gameState.cookies) / gameState.cps
				: 0;

		// Calculate cookies after buying
		const cookiesAfterBuy =
			gameState.cookies + gameState.cps * timeToAfford - cheapestPrice;

		// Calculate new CPS
		const newCps = gameState.cps + cheapestBuilding.baseCpS;

		// Calculate time to reach objective after buying building
		const timeAfterBuy = (objective.value - cookiesAfterBuy) / newCps;

		// Calculate overall time to reach objective when buying cheapest building
		const waitTimeWithBuying = timeToAfford + timeAfterBuy;

		console.log(
			"Time without buy:",
			Math.round(waitTimeWithoutBuying),
			"seconds",
		);
		console.log("Time with buy:", Math.round(waitTimeWithBuying), "seconds");

		//If the time to objective is faster when buying the building
		if (waitTimeWithBuying < waitTimeWithoutBuying) {
			// Buy the cheapest building
			return new PurchaseDecision(gameState, cheapestBuilding);
		}

		// Else wait until the objective is reached
		return new WaitDecision(gameState, Math.ceil(waitTimeWithoutBuying));

		*/
    }
}
