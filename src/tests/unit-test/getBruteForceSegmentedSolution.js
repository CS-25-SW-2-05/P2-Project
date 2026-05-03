import UnitTest from "./unit-test.js";
import { sleep } from "../../utils.js";
import BruteForceSegmented from "../../algorithms/brute-force-segmented.js";

export default class getBruteForceSegmentedSolutionTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "getBruteForceSegmentedSolution",
        instance: new getBruteForceSegmentedSolutionTest(),
    });

    /*
    async runSingleTest(test) {
        let solution = [];
        let bruteForceTest = new BruteForceSegmented();
        let decisions = [];
        let i = 0;
        const expectedSolution = [];

        const objective = new Objective(
            test.objectiveType,
            test.objectiveValue,
        );

        await loadBuildings(test.decisionAmount);

        for (let key in gameState.buildings) {
            decisions[i] = key;
            i++;
        }
        if (objective.type === "cookies") {
            decisions[i] = "wait";
        }

        return;
    }

    async run() {
        let testPassed = true;
        let Tests = [
            { testNr: 1, objectiveType: "production", objectiveValue: 100 },
        ];

        for (let test in Tests) {
            if (!(await this.runSingleTest(Tests[test]))) {
                testPassed = false;
            }
        }

        return testPassed;
    }*/
}
