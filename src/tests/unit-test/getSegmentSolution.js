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
import Algorithm from "../../algorithms/algorithm.js";
import BruteForceSegmented from "../../algorithms/brute-force-segmented.js";

export default class GetSegmentSolutionTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "getSegmentSolution",
        instance: new GetSegmentSolutionTest(),
    });

    doesGameStateMatch(solutionGameState, expectedSolutionGameState) {
        let doTheyMatch = true;
        let i = 0;

        const solutionGameStateBuildings = Object.entries(
            solutionGameState.buildings,
        );
        const expectedSolutionGameStateBuildings = Object.entries(
            expectedSolutionGameState.buildingsOwned,
        );

        for (let buildings in expectedSolutionGameState.buildingsOwned) {
            if (
                expectedSolutionGameStateBuildings[i][1] !==
                solutionGameStateBuildings[i][1].owned
            ) {
                doTheyMatch = false;
            }
            i++;
        }

        if (
            expectedSolutionGameState.buildingCpS !==
                solutionGameState.buildingCpS ||
            expectedSolutionGameState.simulationTime !==
                Number(solutionGameState.simulationTime.toFixed(2))
        ) {
            doTheyMatch = false;
        }

        return doTheyMatch;
    }

    async runSingleTest(test) {
        let didTestPass = true;
        let decisions = [];
        let i = 0;
        const expectedSolution = test.expectedSolution;
        const searchDepth = test.searchDepth;
        const expectedSolutionGameState = test.expectedSolutionGameState;

        await loadBuildings(test.decisionAmount);
        let currentGameState = new GameState();
        let referenceGameState = currentGameState.copy();
        let bestSolutionGameState = referenceGameState.copy();

        for (let key in currentGameState.buildings) {
            decisions[i] = key;
            i++;
        }
        if (test.objectiveType === "cookies") {
            decisions[i] = "wait";
        }

        const objective = new Objective(
            test.objectiveType,
            test.objectiveValue,
        );
        const bruteForceTest = new BruteForceSegmented();

        const returnValue = await bruteForceTest.getSegmentSolution(
            currentGameState,
            decisions,
            searchDepth,
            objective,
            referenceGameState,
            bestSolutionGameState,
        );

        const solution = returnValue[0];
        const solutionGameState = returnValue[1];

        if (expectedSolution.toString() !== solution.toString()) {
            didTestPass = false;
        }

        if (
            !this.doesGameStateMatch(
                solutionGameState,
                expectedSolutionGameState,
            )
        ) {
            didTestPass = false;
        }

        return didTestPass;
    }

    async run() {
        let testPassed = true;
        const Tests = [
            {
                testNr: 1,
                objectiveType: "production",
                objectiveValue: 2,
                decisionAmount: 2,
                searchDepth: 2,
                expectedSolution: [0, 1],
                expectedSolutionGameState: {
                    buildingsOwned: {
                        cursor: 1,
                        grandma: 1,
                    },
                    buildingCpS: 1.1,
                    simulationTime: 105.91,
                },
            },
            {
                testNr: 2,
                objectiveType: "production",
                objectiveValue: 0.1,
                decisionAmount: 2,
                searchDepth: 2,
                expectedSolution: [0, 2],
                expectedSolutionGameState: {
                    buildingsOwned: {
                        cursor: 1,
                    },
                    buildingCpS: 0.1,
                    simulationTime: 15,
                },
            },
            {
                testNr: 3,
                objectiveType: "cookies",
                objectiveValue: 1,
                decisionAmount: 2,
                searchDepth: 2,
                expectedSolution: [2],
                expectedSolutionGameState: {
                    buildingsOwned: {
                        cursor: 0,
                    },
                    buildingCpS: 0,
                    simulationTime: 1,
                },
            },
        ];

        for (let test in Tests) {
            if (!(await this.runSingleTest(Tests[test]))) {
                testPassed = false;
            }
        }

        return testPassed;
    }
}
