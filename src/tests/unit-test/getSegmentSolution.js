import UnitTest from "./unit-test.js";
import { sleep } from "../../utils.js";
import GameState from "/src/cookie-clicker/game-state.js";
import Building, {
    filterValid,
    logBuildingStats,
    cloneBuildings,
} from "/src/cookie-clicker/purchasables/building.js";
import Decision from "/src/algorithms/decisions/decision.js";
import PurchaseDecision from "/src/algorithms/decisions/purchase-decision.js";
import WaitDecision from "/src/algorithms/decisions/wait-decision.js";
import Objective from "/src/algorithms/objective.js";
import Algorithm from "../../algorithms/algorithm.js";
import BruteForceSegmented from "../../algorithms/brute-force-segmented.js";

export default class GetSegmentSolutionTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "getSegmentSolution",
        instance: new GetSegmentSolutionTest(),
    });

    async run() {
        let segmentSolutionData = [];
        let segmentSolution = [];
        let solution = [];
        let currentGameState = new GameState();
        let referenceGameState = currentGameState.copy();
        let bestSolutionGameState = referenceGameState.copy();
        let segmentedSearchDepth = 2;
        const decisions = ["cursor", "grandma"];
        const objective = new Objective("production", 10);

        const bruteForceTest = new BruteForceSegmented();
        segmentSolutionData = await bruteForceTest.getSegmentSolution(
            currentGameState,
            decisions,
            segmentedSearchDepth,
            objective,
            referenceGameState,
            bestSolutionGameState,
        );

        return false;
    }
}
