import UnitTest from "./unit-test.js";
import BruteForceSegmented from "../../algorithms/brute-force-segmented.js";

export default class PermutationsTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "[Brute Force] Permutations",
        instance: new PermutationsTest(),
    });

    async run() {
        const bruteForce = new BruteForceSegmented();
        const memoryLimit = Infinity;

        // Test with 2 decisions (Base 2)
        const decisionsBase2 = ["cursor", "grandma"];
        const expectedBase2 = [
            [[]],
            [[0], [1]],
            [
                [0, 0],
                [0, 1],
                [1, 0],
                [1, 1],
            ],
            [
                [0, 0, 0],
                [0, 0, 1],
                [0, 1, 0],
                [0, 1, 1],
                [1, 0, 0],
                [1, 0, 1],
                [1, 1, 0],
                [1, 1, 1],
            ],
        ];

        // Test with 3 decisions (Base 3)
        const decisionsBase3 = ["cursor", "grandma", "farm"];
        const expectedBase3 = [
            [[]],
            [[0], [1], [2]],
            [
                [0, 0],
                [0, 1],
                [0, 2],
                [1, 0],
                [1, 1],
                [1, 2],
                [2, 0],
                [2, 1],
                [2, 2],
            ],
        ];

        const passedBase2 = await this.testPermutations(
            bruteForce,
            decisionsBase2,
            expectedBase2,
            memoryLimit,
        );
        if (!passedBase2) return false;

        const passedBase3 = await this.testPermutations(
            bruteForce,
            decisionsBase3,
            expectedBase3,
            memoryLimit,
        );
        if (!passedBase3) return false;

        console.log("✅ All permutations succeeded!");
        return true;
    }

    async testPermutations(
        bruteForce,
        decisions,
        expectedPermutations,
        memoryLimit,
    ) {
        console.log(`%cTesting base-${decisions.length}...`, "color: #add8e6");

        for (let i = 0; i < expectedPermutations.length; i++) {
            console.log(
                `%cPermutation Depth%c: ${i}`,
                "font-weight: bold",
                "font-weight: normal",
            );

            let permutations = Array.from(
                { length: Math.pow(decisions.length, i) },
                () => [],
            );

            permutations = await bruteForce.getAllDecisionPermutations(
                permutations,
                decisions,
                i,
                memoryLimit,
            );

            if (
                JSON.stringify(permutations) !==
                JSON.stringify(expectedPermutations[i])
            ) {
                console.log(
                    `Permutation with base ${decisions.length}, depth ${i} failed!`,
                );
                console.log("Expected:", expectedPermutations[i]);
                console.log("Got:", permutations);
                return false;
            }
            console.log("✅ Succeeded!");
        }
        return true;
    }
}
