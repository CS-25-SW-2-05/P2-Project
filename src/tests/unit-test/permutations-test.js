import UnitTest from "./unit-test.js";
import { sleep } from "../../utils.js";
import BruteForceSegmented from "../../algorithms/brute-force-segmented.js";

export default class PermutationsTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "[Brute Force] Permutations",
        instance: new PermutationsTest(),
    });

    async run() {
        const bruteForce = new BruteForceSegmented();

        const decisions = ["cursor", "grandma"];
        const memoryLimit = 3865470566;

        const correctPermutations = [
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

        for (let i = 0; i < 4; i++) {
            console.log(
                "%cPermutation Depth%c:",
                "font-weight: bold",
                "font-weight: normal",
                i,
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

            const doLengthsMatch =
                correctPermutations[i].length === permutations.length;
            if (!doLengthsMatch) {
                console.log("Lengths do not match!");
                return false;
            }

            for (let j = 0; j < permutations.length; j++) {
                const doSubLengthsMatch =
                    correctPermutations[i][j].length === permutations[j].length;
                if (!doSubLengthsMatch) {
                    console.log("Sub lengths do not match!");
                    return false;
                }

                for (let k = 0; k < permutations[j].length; k++) {
                    const correct = correctPermutations[i][j][k];
                    const actual = permutations[j][k];

                    if (actual === correct) continue;

                    console.log(`Permutation with depth ${i} failed!`);
                    console.log("Expected:", correctPermutations[i]);
                    console.log("Got:", permutations);

                    return false;
                }
            }
            console.log("✅ Succeeded!");
        }

        console.log("✅ All permutations succeeded!");
        return true;
    }
}
