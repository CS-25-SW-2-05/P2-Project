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
    console.log(`\nRunning test:`);
    console.log(test.testName);
    console.log({ test });

    // Perform the decision
    const decision = algorithm.getNextDecision(
        test.gameState,
        test.buildings,
        test.objective,
    );

    // Get the expected decision type (purchase/wait)
    const expectedDecisionType = test.expectedDecisionType;

    // Check 1: Is the decision output from the algorithm the correct type and format?
    if (!(decision instanceof expectedDecisionType)) {
        console.log(
            `✖ Failed: Expected ${expectedDecisionType.name}, got ${decision.constructor.name}`,
        );
        return false;
    }

    console.log(`✔ Passed: Decision is ${expectedDecisionType.name}`);

    // If it's a PurchaseDecision, then validate the building
    if (decision instanceof PurchaseDecision) {
        // Check 2: Is the building purchaseable?
        if (!decision.purchaseable) {
            console.log("✖ Failed: Decision has no purchaseable building");
            return false;
        }

        console.log("✔ Passed: Decision has a purchaseable building");

        const selectedBuilding = decision.purchaseable.name;

        // Check 3: Is the building the expected building?
        // First, handle if there is several expected buildings
        if (test.expectedOptions) {
            if (!test.expectedOptions.includes(selectedBuilding)) {
                console.log(
                    `✖ Failed: Expected one of ${test.expectedOptions}, got ${selectedBuilding}`,
                );
                return false;
            }

            // Else handle if there is a single expected building
        } else {
            if (selectedBuilding !== test.expectedBuilding) {
                console.log(
                    `✖ Failed: Expected ${test.expectedBuilding}, got ${selectedBuilding}`,
                );
                return false;
            }
        }

        console.log(`✔ Passed: Selected ${selectedBuilding}`);
    }

    // If it's a WaitDecision, no further checks needed
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
        // Algorithm used for the test
        const algorithm = new GreedyNaive();

        // Default objective
        const defaultObjective = {
            type: "cookies",
            value: 1000,
        };

        // Default gamestate
        const defaultGameState = {
            cookies: 100,
            cps: 1,
        };

        const tests = [
            // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \\
            // -------------------- WRITE TESTS HERE -------------------- \\
            // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \\
            {
                // The name of the test
                testName: "Chooses cheapest building",

                // The objective passed to the algorithm
                // Can either be defaultObjective or custom (see below tests)
                objective: defaultObjective,

                // The gamestate passed to the algorithm
                // Can either be defaultGameState or custom (see below tests)
                gameState: defaultGameState,

                // The building config passed to the algorithm
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 100 },
                    farm: { cost: 500 },
                }),
                // Wich decision type the test expects from the algorithm
                // Can either be PurchaseDecision og WaitDecision
                expectedDecisionType: PurchaseDecision,

                // Which building the test expects to be purchased
                expectedBuilding: "cursor",
            },
            {
                testName: "Chooses cheapest building when order is different",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    farm: { cost: 500 },
                    grandma: { cost: 100 },
                    cursor: { cost: 15 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName:
                    "Chooses cheapest building even if player cannot afford it yet",
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
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName: "Chooses cheapest building when costs are close",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 16 },
                    grandma: { cost: 15 },
                    farm: { cost: 17 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                testName: "Handles same-cost buildings",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 15 },
                    farm: { cost: 500 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedOptions: ["cursor", "grandma"],
            },
            {
                testName: "Ignores CpS and only uses cost",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 1000 },
                    farm: { cost: 500, baseCpS: 10000 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName: "Handles only one building",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName: "Chooses free building",
                objective: defaultObjective,
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 0 },
                    grandma: { cost: 100 },
                    farm: { cost: 500 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName: "Handles very large building costs",
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
                testName:
                    "Waits when cookies objective can be reached before buying",
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
                testName: "Buys cheapest for production objective",
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
                expectedBuilding: "cursor",
            },
            {
                testName:
                    "Buys cheapest for fixed-cookies if it can be bought before horizon",
                objective: {
                    type: "fixed-time-cookies",
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
                expectedBuilding: "cursor",
            },
            {
                testName:
                    "Waits for fixed-cookies if cheapest cannot be bought before horizon",
                objective: {
                    type: "fixed-time-cookies",
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
                testName:
                    "Buys cheapest for fixed-production if it can be bought before horizon",
                objective: {
                    type: "fixed-time-production",
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
                expectedBuilding: "cursor",
            },
            {
                testName:
                    "Waits for fixed-production if cheapest cannot be bought before horizon",
                objective: {
                    type: "fixed-time-production",
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
        ];

        // A variable that is true, as long as no tests has failed
        let allTestsPassed = true;

        // Loop through the tests
        for (const test of tests) {
            // Use the helper function to run tests
            const passed = runSingleTest(algorithm, test);

            // If a test fails, update "allTestPassed"
            if (!passed) {
                console.log(`❌ Test failed`);
                allTestsPassed = false;
            }
        }

        // Return wether a test has failed
        return allTestsPassed;
    }
}
