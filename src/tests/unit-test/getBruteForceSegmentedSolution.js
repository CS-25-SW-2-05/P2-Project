import UnitTest from "./unit-test.js";
import { sleep } from "../../utils.js";
import GameState from "../../cookie-clicker/game-state.js";
import Building, {
    filterValid,
    logBuildingStats,
    cloneBuildings,
    loadBuildings,
} from "../../cookie-clicker/purchasables/building.js";
import Decision from "../../algorithms/decisions/decision.js";
import PurchaseDecision from "../../algorithms/decisions/purchase-decision.js";
import WaitDecision from "../../algorithms/decisions/wait-decision.js";
import Objective from "../../algorithms/objective.js";
import BruteForceSegmented from "../../algorithms/brute-force-segmented.js";

export default class getBruteForceSegmentedSolutionTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "getBruteForceSegmentedSolution",
        instance: new getBruteForceSegmentedSolutionTest(),
    });

    async runSingleTest(test) {
        let testPassed = true;
        let solution = [];
        let decisions = [];
        let i = 0;
        const baseCpS = test.baseCpS;
        const bruteForceTest = new BruteForceSegmented();
        const expectedSolution = test.expectedSolution;
        const controller = new AbortController();
        const signal = controller.signal;

        const objective = new Objective(
            test.objectiveType,
            test.objectiveValue,
        );

        await loadBuildings(test.numberOfBuildings);

        const dummyGameState = new GameState();

        for (let key in dummyGameState.buildings) {
            decisions[i] = key;
            i++;
        }
        if (objective.type === "cookies") {
            decisions[i] = "wait";
        }

        solution = await bruteForceTest.getBruteForceSegmentedSolution(
            objective,
            decisions,
            baseCpS,
            signal,
        );

        if (expectedSolution.toString() !== solution.toString()) {
            testPassed = false;
        }

        return testPassed;
    }

    async run() {
        let allTestsPassed = true;
        let Tests = [
            {
                testNr: 1,
                objectiveType: "production",
                objectiveValue: 0.4,
                numberOfBuildings: 20,
                baseCpS: 1,
                expectedSolution: [0, 0, 0, 0, 20],
            },
            {
                testNr: 2,
                objectiveType: "cookies",
                objectiveValue: 1,
                baseCpS: 1,
                numberOfBuildings: 20,
                expectedSolution: [20],
            },
        ];

        for (let test in Tests) {
            if (!(await this.runSingleTest(Tests[test]))) {
                allTestsPassed = false;
            }
        }

        return allTestsPassed;
    }
}
