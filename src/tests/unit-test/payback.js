import UnitTest from "./unit-test.js";
import ShortestPaybackAfterPurchase from "../../algorithms/greedy-payback.js";
import PurchaseDecision from "../../algorithms/decisions/purchase-decision.js";
import WaitDecision from "../../algorithms/decisions/wait-decision.js";
import { createBuildings } from "./unit-test.js";


// Helper function for running one test case
function runSingleTest(algorithm, test) {
    console.log(`\nRunning test:`);
    console.log(test.testName);
    console.log({ test });

    // Perform the decision
    const decision = algorithm.getNextDecision(
        test.gameState,
        test.objective,
        test.buildings,
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

export default class BuyShortestPaybackTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "[Greedy] Shortest Payback",
        instance: new BuyShortestPaybackTest(),
    });

    async run() {
        // Algorithm used for the test
        const algorithm = new ShortestPaybackAfterPurchase();

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
                testName: "Chooses building with shortest payback time",
                objective: { type: "production", value: 1000 },
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                    farm: { cost: 500, baseCpS: 9 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                testName: "Chooses cheapest when payback ratio is equal",
                objective: { type: "production", value: 1000 },
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 10, baseCpS: 2 },
                    grandma: { cost: 100, baseCpS: 20 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName: "Picks best from three buildings",
                objective: { type: "production", value: 1000 },
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                    farm: { cost: 500, baseCpS: 10 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                testName: "Handles same payback time (tie)",
                objective: { type: "production", value: 1000 },
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 10, baseCpS: 1 },
                    grandma: { cost: 10, baseCpS: 1 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedOptions: ["cursor", "grandma"],
            },
            {
                testName: "Handles only one building available",
                objective: { type: "production", value: 1000 },
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 1 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName: "Chooses best building when order is different",
                objective: { type: "production", value: 1000 },
                gameState: defaultGameState,
                buildings: createBuildings({
                    farm: { cost: 500, baseCpS: 9 },
                    grandma: { cost: 100, baseCpS: 10 },
                    cursor: { cost: 15, baseCpS: 0.1 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                testName: "Skips buildings with zero CpS",
                objective: { type: "production", value: 1000 },
                gameState: defaultGameState,
                buildings: createBuildings({
                    cursor: { cost: 5, baseCpS: 0 },
                    grandma: { cost: 100, baseCpS: 10 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                testName: "Buys for cookies objective when payback is faster than waiting",
                objective: { type: "cookies", value: 1000 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                testName: "Waits for cookies objective when saving up is faster",
                objective: { type: "cookies", value: 110 },
                gameState: { cookies: 100, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                testName: "Waits when building cost exceeds cookies objective",
                objective: { type: "cookies", value: 200 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    grandma: { cost: 250, baseCpS: 1 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                testName: "Buys for production objective",
                objective: { type: "production", value: 10 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                testName: "Waits for fixed-time-cookies if no building fits within horizon",
                objective: { type: "fixed-time-cookies", value: 10 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                testName: "Waits for fixed-time-production if no building fits within horizon",
                objective: { type: "fixed-time-production", value: 10 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 1 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                testName: "Keeps building at exact saveUp equals timeLeft boundary",
                objective: { type: "fixed-time-production", value: 20 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 20, baseCpS: 1 },
                    grandma: { cost: 21, baseCpS: 1000 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName: "Respects non-zero simulation time when filtering buildings",
                objective: { type: "fixed-time-production", value: 100 },
                gameState: { cookies: 0, cps: 1, simulationTime: 50 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 1000 },
                    grandma: { cost: 40, baseCpS: 100 },
                    farm: { cost: 100, baseCpS: 1000 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName: "Buys for fixed-time-cookies when building earns more than waiting",
                objective: { type: "fixed-time-cookies", value: 100 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 1000 },
                    grandma: { cost: 80, baseCpS: 10 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                testName: "Waits for fixed-time-cookies when waiting earns more than buying",
                objective: { type: "fixed-time-cookies", value: 20 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 18, baseCpS: 0.5 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                testName: "Waits for fixed-time-cookies when only remaining building still loses to waiting",
                objective: { type: "fixed-time-cookies", value: 30 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 20, baseCpS: 0.5 },
                    grandma: { cost: 100, baseCpS: 1000 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                testName: "Buys best payback building within fixed-time-production horizon",
                objective: { type: "fixed-time-production", value: 100 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 50, baseCpS: 10 },
                    farm: { cost: 200, baseCpS: 50 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                testName: "Picks best payback from multiple buildings within fixed-time-production horizon",
                objective: { type: "fixed-time-production", value: 30 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 25, baseCpS: 5 },
                    farm: { cost: 50, baseCpS: 10 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
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
