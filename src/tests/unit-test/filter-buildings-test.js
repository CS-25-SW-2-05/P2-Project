import UnitTest from "./unit-test.js";
import { filterValid } from "../../cookie-clicker/purchasables/building.js";
import { createBuildings } from "./unit-test.js";

// Helper function for running one test case
function runSingleTest(test) {
    console.log(`\nRunning test:`);
    console.log(test.testName);
    console.log({ test });

    // Filter the buildings specefied in the test
    const result = filterValid(test.buildings);

    // Save the keys of the result in an array
    const resultKeys = Object.keys(result);
    console.log({ result });

    // Loop throgh expectet keys of buildings,
    // to see if they are included in the result
    for (const expectedKey of test.expectedKeys) {
        if (!resultKeys.includes(expectedKey)) {
            console.log(`✖ Failed: Expected ${expectedKey} to be included`);
            console.log("Actual keys:", resultKeys);
            return false;
        }
    }

    // Loop throgh keys of buildings not expected,
    // to see if they are included in the result
    for (const unexpectedKey of test.unexpectedKeys ?? []) {
        if (resultKeys.includes(unexpectedKey)) {
            console.log(
                `✖ Failed: Expected ${unexpectedKey} to be filtered out`,
            );
            console.log("Actual keys:", resultKeys);
            return false;
        }
    }

    // Log an error, if there is a mismatch
    if (resultKeys.length !== test.expectedKeys.length) {
        console.log("✖ Failed: Wrong number of buildings returned");
        console.log("Expected:", test.expectedKeys);
        console.log("Actual:", resultKeys);
        return false;
    }

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

        let allTestsPassed = true;

        for (const test of tests) {
            const passed = runSingleTest(test);

            if (!passed) {
                console.log(`❌ Test failed`);
                allTestsPassed = false;
            }
        }

        return allTestsPassed;
    }
}
