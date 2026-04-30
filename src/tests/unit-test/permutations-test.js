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

        const segmentedSearchDepth = 3;
        const decisions = Array(2).fill("cursor");
        let permutations = Array.from(
            { length: Math.pow(decisions.length, segmentedSearchDepth) },
            () => [],
        );
        const memoryLimit = 3865470566;

        permutations = await bruteForce.getAllDecisionPermutations(
            permutations,
            decisions,
            segmentedSearchDepth,
            memoryLimit,
        );

        const correctPermutations = [
            [0, 0, 0],
            [0, 0, 1],
            [0, 1, 0],
            [0, 1, 1],
            [1, 0, 0],
            [1, 0, 1],
            [1, 1, 0],
            [1, 1, 1],
        ];

        const permutationsLength = Math.min(
            correctPermutations.length,
            permutations.length,
        );
        for (let i = 0; i < permutationsLength; i++) {
            const correctPermutation = correctPermutations[i];
            const permutation = permutations[i];
            const permutationLength = Math.min(
                correctPermutation.length,
                permutation.length,
            );

            for (let j = 0; j < permutationLength; j++) {
                const correct = correctPermutation[j];
                const actual = permutation[j];
                if (actual === correct) continue;
                return false;
            }
        }

        return true;
    }
}
