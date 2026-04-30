import GameState from "../cookie-clicker/game-state.js";
import Building, {
    cloneBuildings,
    filterValid,
    logBuildingStats,
} from "../cookie-clicker/purchasables/building.js";
import { yieldFrame } from "../utils.js";
import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";
import WaitDecision from "./decisions/wait-decision.js";
import { yieldFrame } from "../utils.js";

export default class BruteForceSegmented extends Algorithm {
    // Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
    static dummy = Algorithm.derived.add({
        name: this.name,
        title: "[Brute Force] Segmented",
        tooltip:
            "Calculates all paths within a segment and chooses the best path–according to the goal–until the goal is met.",
        instance: new BruteForceSegmented(),
    });

    /**
     * @param {GameState} game the current game state
     * @param {Building} buildings a list of all buildings, in their current state
     * @returns {Decision} the next decision to be performed, if it is valid.
     */
    getNextDecision(j, solutionArr, gameState, decisions, objective) {
        // Wait decision
        if (decisions[solutionArr[j]] === "wait") {
            //Calculates how long it takes to achieve the objective cookie value
            let waitTime =
                (objective.value - gameState.cookies) / gameState.cps;
            return new WaitDecision(gameState, Math.ceil(waitTime));
        }
        //Purchase decision
        return new PurchaseDecision(
            gameState,
            gameState.buildings[decisions[solutionArr[j]]],
        );
    }

    async getAllDecisionPermutations(
        permutationArr,
        decisions,
        segmentedSearchDepth,
        memoryLimit,
    ) {
        let permutationNumber = 0;
        const awaitIteration = 100000;
        const permutation = Array(segmentedSearchDepth).fill(0);
        const S = decisions.length;
        console.log(`Generating permuations...`);

        while (true) {
            this.getMemoryStatus(memoryLimit);

            let didChange = false;
            for (let i = permutation.length - 1; i >= 0; i--) {
                if (permutation[i] < S) continue;
                didChange = true;

                const lowerIndex =
                    (i - 1 + permutation.length) % permutation.length;
                permutation[lowerIndex] += 1;

                if (i !== 0) permutation[i] = 0;
                break;
            }

            if (didChange) continue;

            for (let i = 0; i < permutation.length; i++) {
                permutationArr[permutationNumber].push(permutation[i]);
            }

            if (permutation.every((p) => p === S - 1)) {
                break;
            }

            const shouldYield = permutationNumber % awaitIteration === 0;
            if (shouldYield) await yieldFrame();

            permutationNumber++;
            permutation[permutation.length - 1]++;
        }
        return permutationArr;
    }

    /**function checks if the total JS heap size is bigger than
     * the memory limit margin. THIS ONLY WORKS WITH CHROMIUM BROWSERS!!!
     */
    getMemoryStatus(memoryLimit) {
        // toggle on or off
        const memoryLimitActive = true;
        let memoryAllocatedNow = 0;

        try {
            memoryAllocatedNow = performance.memory.totalJSHeapSize;
        } catch {
            return;
        }

        if (memoryLimitActive) {
            if (memoryAllocatedNow >= memoryLimit) {
                throw new Error("Memory limit reached");
            }
        }
    }

    // finds the solution to each segment
    async getSegmentSolution(
        currentGameState,
        decisions,
        segmentedSearchDepth,
        objective,
        referenceGameState,
        bestSolutionGameState,
    ) {
        console.log(
            "Expected nr. of permuations: " +
                Math.pow(decisions.length, segmentedSearchDepth),
        );

        // hard-coded permutation limit to stop out of memory errors
        if (Math.pow(decisions.length, segmentedSearchDepth) >= 20000000) {
            throw new Error(
                "The number of permuations is too high. Try lowering the brute force horizon or the number of buildings",
            );
        }

        // permutation array is initialized
        let permutationArr = Array.from(
            { length: Math.pow(decisions.length, segmentedSearchDepth) },
            () => [],
        );

        let memoryLimit = 0;

        /**memory size limit is saved with a margin of 10%.
         * If the browser does not support performance.memory.jsHeapSizeLimit it moves on
         */
        try {
            memoryLimit = performance.memory.jsHeapSizeLimit * 0.9;
        } catch {}

        // finds all decision permutations and saves them to permutationArr
        permutationArr = await this.getAllDecisionPermutations(
            permutationArr,
            decisions,
            segmentedSearchDepth,
            memoryLimit,
        );

        let saveUpTime = 0;
        let paybackSaveUpTime = 0;
        let objectiveWaitTime = 0;
        let cpsPerTime = 0;
        let decision = 0;

        const awaitIteration = 10000;
        const isCookies = objective.type === "cookies" ? true : false;
        const permutationLength = permutationArr[0].length;
        // toggle prints for debugging
        const testPrint = false;
        // toggle for using paybackSaveUp instead of CPS/simulationTime
        const usePaybackSaveUp = false;
        const progressPrint = true;

        let bestSolution = [
            permutationArr[0],
            currentGameState.cps,
            currentGameState.simulationTime,
            objectiveWaitTime,
        ];

        let tempSolution = [
            permutationArr[0],
            currentGameState.cps,
            currentGameState.simulationTime,
            objectiveWaitTime,
        ];

        // runs through all decision permutations and saves the best one
        for (let i = 0; i < permutationArr.length; i++) {
            currentGameState = referenceGameState.copy();
            paybackSaveUpTime = 0;
            saveUpTime = 0;
            cpsPerTime = 0;

            // memory limit check
            this.getMemoryStatus(memoryLimit);

            // gives way to frames so the html page is interactable while the algorithm is running
            const shouldYield = i % awaitIteration === 0;
            if (shouldYield) await yieldFrame();

            if (progressPrint) {
                if (i % Math.floor(permutationArr.length / 4) === 0) {
                    const progress = Math.ceil(
                        (i / permutationArr.length) * 100,
                    );
                    console.log(`Segment solution progress: ` + progress + `%`);
                }
            }

            // Runs through each decision in the permuation
            for (let j = 0; j < permutationArr[i].length; j++) {
                if (!isCookies) {
                    decision = new PurchaseDecision(
                        currentGameState,
                        currentGameState.buildings[
                            decisions[permutationArr[i][j]]
                        ],
                    );
                    decision.perform();

                    /*
					if the production objective is reached, a marker is added at the end 
					of the permutation, which corresponds to the last decision number + 1
					*/
                    if (currentGameState.buildingCpS >= objective.value) {
                        for (let l = 0; l < permutationLength - (j + 1); l++) {
                            permutationArr[i].pop();
                        }
                        permutationArr[i].push(Number(decisions.length));
                        break;
                    }

                    continue;
                }

                if (decisions[permutationArr[i][j]] === "wait") {
                    // calculates time until cookie objective completion
                    let waitSaveUpTime =
                        (objective.value - currentGameState.cookies) /
                        currentGameState.cps;
                    decision = new WaitDecision(
                        currentGameState,
                        Math.ceil(waitSaveUpTime),
                    );
                    decision.perform();

                    /* 
					if the wait decision is made, the rest of the decisions
					must be removed from the permutation, as the wait decision
					ends the decision chain.
					 */
                    for (let l = j; l < permutationArr[i].length; l++) {
                        permutationArr[i].pop();
                    }

                    break;
                }

                saveUpTime =
                    (currentGameState.buildings[decisions[permutationArr[i][j]]]
                        .cost -
                        currentGameState.cookies) /
                    currentGameState.cps;

                paybackSaveUpTime +=
                    currentGameState.buildings[decisions[permutationArr[i][j]]]
                        .cost /
                        currentGameState.buildings[
                            decisions[permutationArr[i][j]]
                        ].baseCpS +
                    saveUpTime;

                decision = new PurchaseDecision(
                    currentGameState,
                    currentGameState.buildings[decisions[permutationArr[i][j]]],
                );
                decision.perform();
            }
            // the permuation has now been performed and must now be evaluated

            /**if the new permutation has the exact same decisions and order as
             * the last permutation, it can be skipped */
            if (
                i > 0 &&
                permutationArr[i].toString() ===
                    permutationArr[i - 1].toString()
            ) {
                continue;
            }

            /**The objective wait time is the time until the cookie objective is met
             * plus the simulationTime of the permuation. If the permuation already has
             * a wait decision, then the objective wait time is already included in the
             * simulationTime variable.
             */
            if (
                tempSolution[0][tempSolution[0].length - 1] ===
                decisions.length - 1
            ) {
                objectiveWaitTime =
                    currentGameState.simulationTime -
                    referenceGameState.simulationTime;
            } else {
                objectiveWaitTime =
                    currentGameState.simulationTime -
                    referenceGameState.simulationTime +
                    (objective.value - currentGameState.cookies) /
                        currentGameState.cps;
            }

            cpsPerTime =
                (currentGameState.buildingCpS -
                    referenceGameState.buildingCpS) /
                (currentGameState.simulationTime +
                    0.00000001 -
                    referenceGameState.simulationTime);

            tempSolution = [
                permutationArr[i],
                usePaybackSaveUp ? paybackSaveUpTime : cpsPerTime,
                currentGameState.simulationTime,
                objectiveWaitTime,
            ];

            if (testPrint) {
                console.log(`Temp segment solution:`, permutationArr[i]);
                console.log(currentGameState);
            }

            // first permutation is the best one, since there are no others to compare to yet
            if (i === 0) {
                bestSolution[0] = tempSolution[0];
                bestSolution[1] = tempSolution[1];
                bestSolution[2] = tempSolution[2];
                bestSolution[3] = tempSolution[3];
                bestSolutionGameState = currentGameState.copy();
                if (testPrint) {
                    console.log(
                        `Temp BEST segment solution:`,
                        permutationArr[i],
                    );
                }
                continue;
            }

            // if cookies are the objective, permutations are evaluated differently
            if (isCookies) {
                if (
                    tempSolution[0][tempSolution[0].length - 1] ===
                        decisions.length - 1 ||
                    bestSolution[0][bestSolution[0].length - 1] ===
                        decisions.length - 1
                ) {
                    // lowest objectiveWaitTime
                    if (tempSolution[3] < bestSolution[3]) {
                        bestSolution[0] = tempSolution[0];
                        bestSolution[1] = tempSolution[1];
                        bestSolution[2] = tempSolution[2];
                        bestSolution[3] = tempSolution[3];
                        bestSolutionGameState = currentGameState.copy();
                        if (testPrint) {
                            console.log(
                                `Temp BEST segment solution:`,
                                permutationArr[i],
                            );
                        }
                    }

                    continue;
                }

                // highest cpsPerTime
                if (tempSolution[1] > bestSolution[1]) {
                    bestSolution[0] = tempSolution[0];
                    bestSolution[1] = tempSolution[1];
                    bestSolution[2] = tempSolution[2];
                    bestSolution[3] = tempSolution[3];
                    bestSolutionGameState = currentGameState.copy();
                    if (testPrint) {
                        console.log(
                            `Temp BEST segment solution:`,
                            permutationArr[i],
                        );
                    }
                }
                continue;
            }

            /* 
			If there is a permutation with a wait marker, the wait time to reach 
			the objective value is used for evaluating the better solution
			*/
            if (
                tempSolution[0][tempSolution[0].length - 1] ===
                    decisions.length ||
                bestSolution[0][bestSolution[0].length - 1] ===
                    decisions.length ||
                currentGameState.buildingCpS < objective.value
            ) {
                // lowest simulationTime
                if (tempSolution[2] < bestSolution[2]) {
                    bestSolution[0] = tempSolution[0];
                    bestSolution[1] = tempSolution[1];
                    bestSolution[2] = tempSolution[2];
                    bestSolution[3] = tempSolution[3];
                    bestSolutionGameState = currentGameState.copy();
                    if (testPrint) {
                        console.log(
                            `Temp BEST segment solution:`,
                            permutationArr[i],
                        );
                    }
                }

                continue;
            }

            // highest cpsPerTime
            if (tempSolution[1] > bestSolution[1]) {
                bestSolution[0] = tempSolution[0];
                bestSolution[1] = tempSolution[1];
                bestSolution[2] = tempSolution[2];
                bestSolution[3] = tempSolution[3];
                bestSolutionGameState = currentGameState.copy();
                if (testPrint) {
                    console.log(
                        `Temp BEST segment solution:`,
                        permutationArr[i],
                    );
                }
            }

            /*If this point is reached, the permuation has been calculated and evaluated. 
            The algorithm will now move onto the next permuation, if there are more left */
        }

        /*When this point is reached, all permuations have been evaluated, 
        and the best solution has been found */
        if (testPrint) {
            console.log(`BEST segment solution:`, bestSolution[0]);
        }

        let returnValue = [bestSolution[0], bestSolutionGameState];

        return returnValue;
    }

    // connects the segmented solutions together and returns the final solution
    async getBruteForceSegmentedSolution(objective, decisions) {
        let endMarker = 0;
        let totalSimulationTime = 0;
        let segmentSolutionData = [];
        let segmentSolution = [];
        let solution = [];
        let currentGameState = new GameState();

        console.log(currentGameState.buildings);

        let referenceGameState = currentGameState.copy();
        let bestSolutionGameState = referenceGameState.copy();

        let segmentedSearchDepth = document.getElementById(
            "brute-force-horizon",
        ).valueAsNumber;

        console.log("search depth:", segmentedSearchDepth);

        if (segmentedSearchDepth <= 1) {
            throw new Error(`Please select a search depth higher than 1`);
        }

        //This loop is for the production objective
        if (objective.type === "production") {
            for (let i = 0; endMarker !== decisions.length; i++) {
                segmentSolutionData = await this.getSegmentSolution(
                    currentGameState,
                    decisions,
                    segmentedSearchDepth,
                    objective,
                    referenceGameState,
                    bestSolutionGameState,
                );
                if (segmentSolutionData === null) return null;

                console.log(
                    "bestSolutionGameState.buildingCpS3",
                    segmentSolutionData[1].buildingCpS,
                );

                console.log("Segment solution: " + segmentSolution);

                if (
                    referenceGameState.buildingCpS >=
                    segmentSolutionData[1].buildingCpS
                ) {
                    throw new Error(
                        `Best solution game state is somehow lower than last iteration, 
			                indicating inconsistency in game state transfer`,
                    );
                }

                /*console.log(
                    "referenceGameStateBEFORE",
                    referenceGameState.buildingCpS,
                );*/

                segmentSolution = segmentSolutionData[0];
                referenceGameState = segmentSolutionData[1].copy();

                console.log(
                    `Segment solution ` + (i + 1) + `: ` + segmentSolution,
                );

                /*console.log(
                    "referenceGameStateAFTER",
                    referenceGameState.buildingCpS,
                );*/

                if (
                    referenceGameState.buildingCpS !==
                    segmentSolutionData[1].buildingCpS
                ) {
                    throw new Error(
                        `Best solution game state did not get copied to reference game state correctly`,
                    );
                }

                totalSimulationTime += referenceGameState.simulationTime;
                solution.push(...segmentSolution);
                endMarker = solution[solution.length - 1];

                console.log(referenceGameState);
            }

            console.log("Final solution: " + solution);
            return solution;
        }

        //This loop is for the cookies objective
        for (let i = 0; endMarker !== decisions.length - 1; i++) {
            segmentSolutionData = await this.getSegmentSolution(
                currentGameState,
                decisions,
                segmentedSearchDepth,
                objective,
                referenceGameState,
                bestSolutionGameState,
            );

            if (
                referenceGameState.buildingCpS >
                segmentSolutionData[1].buildingCpS
            ) {
                throw new Error(
                    `Best solution game state is somehow lower than last iteration, 
			                indicating inconsistency in game state transfer`,
                );
            }

            /*console.log(
                "referenceGameStateBEFORE",
                referenceGameState.buildingCpS,
            );*/

            segmentSolution = segmentSolutionData[0];
            referenceGameState = segmentSolutionData[1].copy();

            console.log(`Segment solution ` + (i + 1) + `: ` + segmentSolution);

            /*console.log(
                "referenceGameStateAFTER",
                referenceGameState.buildingCpS,
            );*/

            if (
                referenceGameState.buildingCpS !==
                segmentSolutionData[1].buildingCpS
            ) {
                throw new Error(
                    `Best solution game state did not get copied to reference game state correctly`,
                );
            }

            totalSimulationTime += referenceGameState.simulationTime;
            solution.push(...segmentSolution);
            endMarker = solution[solution.length - 1];

            console.log(referenceGameState);
        }
        console.log("Final solution: " + solution);
        return solution;
    }
}
