import UnitTest from "./unit-test.js";
import GreedySmart from "../../algorithms/greedy-payback-time.js";
import PurchaseDecision from "../../algorithms/decisions/purchase-decision.js";
import WaitDecision from "../../algorithms/decisions/wait-decision.js";

// Calculates the payback + save-up score used by the algorithm
function calcPaybackSaveUp(building, gameState) {
    const saveUpTime = (building.cost - gameState.cookies) / gameState.cps;
    const paybackTime = building.cost / building.baseCpS;
    return saveUpTime + paybackTime;
}

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

    // Log payback + save-up scores so the algorithm's choice is easy to verify
    console.log("Payback+saveup scores:");
    for (const key in test.buildings) {
        const score = calcPaybackSaveUp(test.buildings[key], test.gameState);
        console.log(`  ${key}: ${score}`);
    }

    // Perform the decision
    const decision = algorithm.getNextDecision(
        test.gameState,
        test.buildings,
        test.objective,
    );

    // Get the expected decision type (purchase/wait)
    const expectedDecisionType = test.expectedDecisionType;

    // Check 1: Is the decision output from the algorithm the correct type and format?
    // Support both a single type and an array of acceptable types
    const acceptedTypes = test.expectedDecisionTypes ?? [expectedDecisionType];
    if (!acceptedTypes.some((type) => decision instanceof type)) {
        console.log(
            `✖ Failed: Expected one of [${acceptedTypes.map((t) => t.name).join(", ")}], got ${decision.constructor.name}`,
        );
        return false;
    }

    console.log(`✔ Passed: Decision is ${decision.constructor.name}`);

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

export default class BuySmartestTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "[Greedy] Shortest Payback (+Save-up)",
        instance: new BuySmartestTest(),
    });

    async run() {
        // Algorithm used for the test
        const algorithm = new GreedySmart();

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

        // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \\
        // ---------- PAYBACK + SAVE-UP SCORE REFERENCE ----------- \\
        // score = (cost - cookies) / cps  +  cost / baseCpS        \\
        // Lower score = better choice                               \\
        // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \\

        const tests = [
            // --- Building selection ---
            {
                // cursor: score = 15 + 150 = 165
                // grandma: score = 100 + 10 = 110  ← best
                // farm: curveball, highest cost, but not great cps
                testName: "Chooses best payback+saveup building, not cheapest",
                objective: { type: "production", value: 1000 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                    farm: { cost: 500, baseCpS: 9 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                // cursor: score = 15 + 15 = 30  ← best
                // grandma: score = 100 + 100 = 200
                testName: "Chooses cheapest when baseCpS is equal",
                objective: { type: "production", value: 1000 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 1 },
                    grandma: { cost: 100, baseCpS: 1 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                // cursor: score = 15 + 150 = 165
                // grandma: score = 100 + 10 = 110  ← best
                // farm: score = 500 + 50 = 550
                testName: "Picks best from three buildings",
                objective: { type: "production", value: 1000 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                    farm: { cost: 500, baseCpS: 10 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                // With 90 cookies: cursor saveUp = (15-90)/1 = -75, payback = 150 → score = 75
                //                  grandma saveUp = (100-90)/1 = 10, payback = 10  → score = 20  ← best
                testName: "Accounts for current cookies in save-up time",
                objective: { type: "production", value: 1000 },
                gameState: { cookies: 90, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                // With 200 cookies both are already affordable (negative saveUp)
                // cursor: saveUp=-185, payback=30   → score=-155  ← best
                // grandma: saveUp=-100, payback=100 → score=0
                testName:
                    "Handles already-affordable building (negative save-up time)",
                objective: { type: "production", value: 1000 },
                gameState: { cookies: 200, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.5 },
                    grandma: { cost: 100, baseCpS: 1 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                // cursor: score = 10 + 10 = 20
                // grandma: score = 10 + 10 = 20  (tie)
                testName: "Handles same payback+saveup time (tie)",
                objective: { type: "production", value: 1000 },
                gameState: { cookies: 0, cps: 1 },
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
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 1 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },
            {
                // Same buildings as the first test but inserted in reverse order
                // Algorithm should still pick grandma (best score), proving the
                // result doesn't depend on object key order
                testName: "Order of buildings does not affect choice",
                objective: { type: "production", value: 1000 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    farm: { cost: 500, baseCpS: 9 },
                    grandma: { cost: 100, baseCpS: 10 },
                    cursor: { cost: 15, baseCpS: 0.1 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },

            // --- Cookies objective ---
            {
                // waitSaveUpTime = (110-100)/1 = 10
                // cursor score = (15-100)/1 + 15/0.1 = -85+150 = 65
                // 10 <= 65 → wait
                testName:
                    "Waits for cookies objective when saving up is faster than buying",
                objective: { type: "cookies", value: 110 },
                gameState: { cookies: 100, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                // waitSaveUpTime = (10000-0)/1 = 10000
                // cursor score  = 15  + 15/0.1    = 165
                // grandma score = 100 + 100/1000  = 100.1  ← best
                // 10000 > 100.1 → buy grandma (more expensive but better payback)
                testName:
                    "Buys for cookies objective when buying+payback is faster than saving",
                objective: { type: "cookies", value: 10000 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 1000 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },
            {
                // waitSaveUpTime = (20-0)/1 = 20
                // cursor score   = 10 + 10/1 = 20  ← best (exactly equal to wait time)
                // grandma score  = 12 + 12/1 = 24
                // Algorithm uses `<=`: 20 <= 20 → wait
                testName:
                    "Cookies waits at exact boundary (waitSaveUpTime == best score)",
                objective: { type: "cookies", value: 20 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 10, baseCpS: 1 },
                    grandma: { cost: 12, baseCpS: 1 },
                }),
                expectedDecisionType: WaitDecision,
            },

            // --- Production objective ---
            {
                // cursor score  = 15  + 15/0.1  = 165
                // grandma score = 100 + 100/10  = 110  ← best (more expensive but better payback)
                testName: "Always buys for production objective (never waits)",
                objective: { type: "production", value: 10 },
                gameState: { cookies: 0, cps: 1 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "grandma",
            },

            // --- Fixed-time objectives: filtering ---
            {
                // cursor saveUp = 15 > 10 → filtered; grandma saveUp = 100 > 10 → filtered
                // No buildings left → wait
                testName:
                    "Waits for fixed-time-cookies when no building fits within horizon",
                objective: { type: "fixed-time-cookies", value: 10 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 100, baseCpS: 10 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                // cursor saveUp = 15 > 10 → filtered
                // No buildings left → wait
                testName:
                    "Waits for fixed-time-production when no building fits within horizon",
                objective: { type: "fixed-time-production", value: 10 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 1 },
                }),
                expectedDecisionType: WaitDecision,
            },

            {
                // simulationTime=50, value=100 → timeLeft = 50
                // cursor: saveUp=15 ≤ 50 → kept; score = 15 + 0.015 = 15.015 ← best
                // grandma: saveUp=40 ≤ 50 → kept; score = 40 + 0.4 = 40.4
                // farm: saveUp=100 > 50 → filtered
                // bestSaveUpTime = 15
                //   cookiesFromWaiting = 0 + 1*50 = 50
                //   cookiesGainedFromBuying = (50-15)*1000 = 35000
                //   cookiesFromBuying = 50 - 15 + 35000 = 35035
                //   50 < 35035 → buy cursor
                testName:
                    "Fixed-time-cookies respects non-zero simulationTime",
                objective: { type: "fixed-time-cookies", value: 100 },
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
                // Filter boundary: saveUp == timeLeft must be kept (uses <=)
                // timeLeft=20: cursor saveUp=20 ≤ 20 → kept (boundary); grandma saveUp=21 > 20 → filtered
                // For fixed-time-production, always buys best (only cursor passes)
                testName:
                    "Fixed-time-production keeps building at exact saveUp == timeLeft boundary",
                objective: { type: "fixed-time-production", value: 20 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 20, baseCpS: 1 },
                    grandma: { cost: 21, baseCpS: 1000 },
                }),
                expectedDecisionType: PurchaseDecision,
                expectedBuilding: "cursor",
            },

            // --- Fixed-time-cookies: buy vs wait comparison ---
            {
                // Both buildings fit in horizon (timeLeft=100)
                // cursor score  = 15  + 15/1000  = 15.015  ← best
                // grandma score = 80  + 80/10    = 88
                // Algorithm picks cursor; then buy vs wait:
                //   cookiesFromWaiting = 100
                //   cookiesGainedFromBuying = (100-15)*1000 = 85000
                //   cookiesFromBuying = 100 - 15 + 85000 = 85085
                //   100 < 85085 → buy cursor
                testName:
                    "Buys for fixed-time-cookies when building earns more than waiting",
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
                // Both buildings fit in horizon (timeLeft=20)
                // cursor score  = 15 + 15/0.1  = 165
                // grandma score = 18 + 18/0.5  = 54   ← best
                // Algorithm picks grandma; then buy vs wait:
                //   cookiesFromWaiting = 20
                //   cookiesGainedFromBuying = (20-18)*0.5 = 1
                //   cookiesFromBuying = 20 - 18 + 1 = 3
                //   20 >= 3 → wait
                testName:
                    "Waits for fixed-time-cookies when waiting earns more than buying",
                objective: { type: "fixed-time-cookies", value: 20 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 15, baseCpS: 0.1 },
                    grandma: { cost: 18, baseCpS: 0.5 },
                }),
                expectedDecisionType: WaitDecision,
            },
            {
                // Partial filter + wait combined:
                // timeLeft=30
                // cursor: saveUp=20 ≤ 30 → kept; score = 20 + 20/0.5 = 60  ← best (only one left)
                // grandma: saveUp=100 > 30 → filtered
                // bestSaveUpTime = 20
                //   cookiesFromWaiting = 0 + 1*30 = 30
                //   cookiesGainedFromBuying = (30-20)*0.5 = 5
                //   cookiesFromBuying = 30 - 20 + 5 = 15
                //   30 >= 15 → wait
                testName:
                    "Fixed-time-cookies waits when partial-filter survivor still earns less than waiting",
                objective: { type: "fixed-time-cookies", value: 30 },
                gameState: { cookies: 0, cps: 1, simulationTime: 0 },
                buildings: createBuildings({
                    cursor: { cost: 20, baseCpS: 0.5 },
                    grandma: { cost: 100, baseCpS: 1000 },
                }),
                expectedDecisionType: WaitDecision,
            },

            // --- Fixed-time-production: always buy the best within horizon ---
            {
                // cursor saveUp=15 ≤ 100 → kept; score = 15+150 = 165
                // grandma saveUp=50 ≤ 100 → kept; score = 50+5 = 55  ← best
                // farm saveUp=200 > 100 → filtered
                testName:
                    "Fixed-time-production buys best payback building within horizon",
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
                // Both fit in horizon (timeLeft=30): cursor saveUp=15, grandma saveUp=25
                // cursor score  = 15 + 15/0.1 = 165
                // grandma score = 25 + 25/5   = 30    ← best (more expensive but better payback)
                // farm saveUp=50 > 30 → filtered
                testName:
                    "Fixed-time-production picks best payback from multiple affordable buildings",
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
