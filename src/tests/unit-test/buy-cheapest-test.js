import UnitTest from "./unit-test.js";
import GreedyNaive from "../../algorithms/greedy-naive.js";
import PurchaseDecision from "../../algorithms/decisions/purchase-decision.js";
import WaitDecision from "../../algorithms/decisions/wait-decision.js";

// Helper function for creating buildings object
function createBuildings(buildingsInput) {
    const buildings = {};

    // Loop through each building name (key)
    for (const key in buildingsInput) {
        const building = buildingsInput[key];

        // Create a building object
        buildings[key] = {
            // Use the key as the name
            name: key,
            // Set cost
            cost: building.cost,
            // Optional CPS (default = 0)
            baseCpS: building.baseCpS ?? 0,
            // Required by PurchaseDecision
            canPurchase: building.canPurchase ?? (() => true),
        };
    }

    return buildings;
}

// Helper function for running one test case
function runSingleTest(algorithm, test) {
    console.log(`\n --- Running test: ---`);
    console.log(test);

    const decision = algorithm.getNextDecision(
        test.gameState,
        test.buildings,
        test.objective,
    );

    const expectedDecisionType = test.expectedDecisionType ?? PurchaseDecision;

    // Check 1: Correct decision type
    if (!(decision instanceof expectedDecisionType)) {
        console.log(
            `✖ Failed: Expected ${expectedDecisionType.name}, got ${decision.constructor.name}`,
        );
        return false;
    }

    console.log(`✔ Passed: Decision is ${expectedDecisionType.name}`);

    // If it's a PurchaseDecision → validate building
    if (decision instanceof PurchaseDecision) {
        // Check 2: Has purchaseable
        if (!decision.purchaseable) {
            console.log("✖ Failed: Decision has no purchaseable building");
            return false;
        }

        console.log("✔ Passed: Decision has a purchaseable building");

        const selectedBuilding = decision.purchaseable.name;

        // Check 3: Correct building
        if (test.expectedOptions) {
            if (!test.expectedOptions.includes(selectedBuilding)) {
                console.log(
                    `✖ Failed: Expected one of ${test.expectedOptions}, got ${selectedBuilding}`,
                );
                return false;
            }
        } else {
            if (selectedBuilding !== test.expected) {
                console.log(
                    `✖ Failed: Expected ${test.expected}, got ${selectedBuilding}`,
                );
                return false;
            }
        }

        console.log(`✔ Passed: Selected ${selectedBuilding}`);
    }

    // If it's a WaitDecision → no further checks needed (for now)
    if (decision.constructor.name === "WaitDecision") {
        console.log("✔ Passed: WaitDecision returned");
    }

    console.log(`✅ Test passed`);
    return true;
}

export default class BuyCheapestTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "[Greedy] Buy Cheapest",
        instance: new BuyCheapestTest(),
    });

    async run() {
        const algorithm = new GreedyNaive();

        const defaultObjective = {
            type: "cookies",
            value: 1000,
        };

        const defaultGameState = {
            cookies: 100,
            cps: 1,
        };

        const tests = [
            {
                name: "Chooses cheapest building",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 100 },
                    farm: { cost: 500 },
                }),
                expected: "cursor",
            },
            {
                name: "Chooses cheapest building when order is different",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    farm: { cost: 500 },
                    grandma: { cost: 100 },
                    cursor: { cost: 15 },
                }),
                expected: "cursor",
            },
            {
                name: "Chooses cheapest building even if player cannot afford it yet",
                objective: defaultObjective,
                gameState: {
                    cookies: 0,
                    cps: 1,
                },
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 100 },
                    farm: { cost: 500 },
                }),
                expected: "cursor",
            },
            {
                name: "Chooses cheapest building when costs are close",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 16 },
                    grandma: { cost: 15 },
                    farm: { cost: 17 },
                }),
                expected: "grandma",
            },
            {
                name: "Handles same-cost buildings",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 15 },
                    farm: { cost: 500 },
                }),
                expectedOptions: ["cursor", "grandma"],
            },
            {
                name: "Ignores CpS and only uses cost",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 1000 },
                    farm: { cost: 500, baseCpS: 10000 },
                }),
                expected: "cursor",
            },
            {
                name: "Handles only one building",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15 },
                }),
                expected: "cursor",
            },
            {
                name: "Chooses free building",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 0 },
                    grandma: { cost: 100 },
                    farm: { cost: 500 },
                }),
                expected: "cursor",
            },
            {
                name: "Handles very large building costs",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 1e100 },
                    grandma: { cost: 1e50 },
                    farm: { cost: 1e75 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                name: "Waits when cookies objective can be reached before buying",
                objective: {
                    type: "cookies",
                    value: 110,
                },
                gameState: {
                    cookies: 100,
                    cps: 1,
                },
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 100 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                name: "Buys cheapest for production objective",
                objective: {
                    type: "production",
                    value: 10,
                },
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 100 },
                }),
                expectedDecisionType: PurchaseDecision,
                expected: "cursor",
            },
            {
                name: "Waits for fixed-cookies if cheapest cannot be bought before horizon",
                objective: {
                    type: "fixed-cookies",
                    value: 10,
                },
                gameState: {
                    cookies: 0,
                    cps: 1,
                    simulationTime: 0,
                },
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 100 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                name: "Buys cheapest for fixed-production if it can be bought before horizon",
                objective: {
                    type: "fixed-production",
                    value: 20,
                },
                gameState: {
                    cookies: 0,
                    cps: 1,
                    simulationTime: 0,
                },
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 100 },
                }),
                expectedDecisionType: PurchaseDecision,
                expected: "cursor",
            },
        ];

        let allTestsPassed = true;

        for (const test of tests) {
            const passed = runSingleTest(algorithm, test);

            if (!passed) {
                console.log(`❌ Test failed`);
                allTestsPassed = false;
            }
        }

        return allTestsPassed;
    }
}
