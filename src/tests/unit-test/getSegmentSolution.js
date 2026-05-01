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

    async run() {
        let testPassed = true;
        let returnValue = [];
        let segmentSolution = [];
        let segmentSolutionGameState = 0;
        let segmentedSearchDepth = 2;
        let decisions = [];
        let i = 0;

        await loadBuildings(2);
        let currentGameState = new GameState();
        let referenceGameState = currentGameState.copy();
        let bestSolutionGameState = referenceGameState.copy();

        console.log(currentGameState);

        for (let key in currentGameState.buildings) {
            decisions[i] = key;
            i++;
        }

        console.log(decisions[0]);
        const objective = new Objective("production", 2);

        //throw new Error("bruh");

        const bruteForceTest = new BruteForceSegmented();
        returnValue = await bruteForceTest.getSegmentSolution(
            currentGameState,
            decisions,
            segmentedSearchDepth,
            objective,
            referenceGameState,
            bestSolutionGameState,
        );

        segmentSolution = returnValue[0];

        let expectedSegmentSolution = [1, 0];

        console.log(expectedSegmentSolution);

        console.log(segmentSolution);
        if (expectedSegmentSolution.toString() !== segmentSolution.toString()) {
            testPassed = false;
        }

        return testPassed;
    }
}
