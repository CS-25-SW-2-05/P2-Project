import UnitTest from "./unit-test.js";
import { filterValid } from "../../cookie-clicker/purchasables/building.js";
import { createBuildings } from "./unit-test.js";

// Helper function for running one test case
function runSingleTest(test) {
    console.log(`\nRunning test:`);
    console.log(test.testName);
    console.log({ test });

    // Filter the buildings specified in the test
    const validBuildings = filterValid(test.buildings);

    // Save the keys of the result in an array
    const validBuildingKeys = Object.keys(validBuildings);
    console.log({ result: validBuildings });

    // Loop throgh expectet keys of buildings,
    // to see if they are included in the result
    for (const expectedKey of test.expectedKeys) {
        // Print an error if the valid building key
        // doesn't match the expected key
        if (!validBuildingKeys.includes(expectedKey)) {
            console.log(`✖ Failed: Expected ${expectedKey} to be included`);
            console.log("Actual keys:", validBuildingKeys);
            return false;
        }
    }

    // Loop throgh keys of buildings not expected,
    // to see if they are included in the result
    // Use an empty array, if unexpectedKeys isn't defined in the test
    for (const unexpectedKey of test.unexpectedKeys ?? []) {
        // If the valid building keys includes buildings not exptected,
        // log an error
        if (validBuildingKeys.includes(unexpectedKey)) {
            console.log(
                `✖ Failed: Expected ${unexpectedKey} to be filtered out`,
            );
            console.log("Actual keys:", validBuildingKeys);
            return false;
        }
    }

    // Log an error, if there is a mismatch in the number of valid buildings
    // and the expectet valid buildings
    if (validBuildingKeys.length !== test.expectedKeys.length) {
        console.log("✖ Failed: Wrong number of buildings returned");
        console.log("Expected:", test.expectedKeys);
        console.log("Actual:", validBuildingKeys);
        return false;
    }

    // If no error is detected, log the test succes
    console.log("✔ Passed: Correct buildings returned");
    console.log(`✅ Test passed`);
    return true;
}

export default class FilterValidTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "Filter Valid Buildings",
        instance: new FilterValidTest(),
    });

    async run() {
        const tests = [
            {
                testName: "Keeps valid buildings",
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: 100 },
                    farm: { cost: 500 },
                }),
                expectedKeys: ["cursor", "grandma", "farm"],
            },
            {
                testName: "Filters out buildings that cannot be purchased",
                buildings: createBuildings({
                    cursor: { cost: 15, canPurchase: () => true },
                    grandma: { cost: 100, canPurchase: () => false },
                    farm: { cost: 500, canPurchase: () => true },
                }),
                expectedKeys: ["cursor", "farm"],
                unexpectedKeys: ["grandma"],
            },
            {
                testName: "Filters out buildings with Infinity cost",
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: Infinity },
                    farm: { cost: 500 },
                }),
                expectedKeys: ["cursor", "farm"],
                unexpectedKeys: ["grandma"],
            },
            {
                testName: "Filters out buildings with NaN cost",
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: NaN },
                    farm: { cost: 500 },
                }),
                expectedKeys: ["cursor", "farm"],
                unexpectedKeys: ["grandma"],
            },
            {
                testName:
                    "Filters out buildings that are both maxed and infinite",
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: Infinity, canPurchase: () => false },
                    farm: { cost: 500 },
                }),
                expectedKeys: ["cursor", "farm"],
                unexpectedKeys: ["grandma"],
            },
            {
                testName: "Returns empty object when no buildings are valid",
                buildings: createBuildings({
                    cursor: { cost: Infinity },
                    grandma: { cost: 100, canPurchase: () => false },
                }),
                expectedKeys: [],
                unexpectedKeys: ["cursor", "grandma"],
            },
            {
                testName: "Keeps building with zero cost",
                buildings: createBuildings({
                    cursor: { cost: 0 },
                    grandma: { cost: 100 },
                }),
                expectedKeys: ["cursor", "grandma"],
            },
            {
                testName: "Filters out building with negative Infinity cost",
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: -Infinity },
                }),
                expectedKeys: ["cursor"],
                unexpectedKeys: ["grandma"],
            },
            {
                testName: "Filters out building with undefined cost",
                buildings: createBuildings({
                    cursor: { cost: 15 },
                    grandma: { cost: undefined },
                }),
                expectedKeys: ["cursor"],
                unexpectedKeys: ["grandma"],
            },
            {
                testName: "Keeps very large finite cost",
                buildings: createBuildings({
                    cursor: { cost: 1e100 },
                    grandma: { cost: 100 },
                }),
                expectedKeys: ["cursor", "grandma"],
            },
        ];

        // A variable that is true, as long as no tests has failed
        let allTestsPassed = true;

        // Loop through the tests
        for (const test of tests) {
            // Use the helper function to run tests
            const passed = runSingleTest(test);

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
