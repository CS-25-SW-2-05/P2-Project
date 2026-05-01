import GameState from "../cookie-clicker/game-state.js";
import Building, {
    filterValid,
    logBuildingStats,
} from "../cookie-clicker/purchasables/building.js";
import { yieldFrame } from "../utils.js";
import Decision from "./decisions/decision.js";
import Objective from "./objective.js";

export default class Algorithm {
    static derived = new Set();
    #isRunning = false;
    #runPromise = null;

    constructor() {
        if (new.target != Algorithm) return;
        throw new Error(
            "Cannot instantiate abstract class Algorithm directly.",
        );
    }

    /**
     * @param {GameState} game the current game state
     * @param {Objective} objective the current objective
     * @param {Building} buildings a list of all buildings, in their current state
     * @returns {Decision} the next decision to be performed, if it is valid.
     */
    async getNextDecision(gameState, objective, buildings, signal) {
        throw new Error(
            `Method '${this.getNextDecision.name}' must be implemented by subclass.`,
        );
    }

    /**
     * Run the algorithm until a non-valid decision occurs.
     * @param {Objective} objective passed in from script.js when the form is submitted
     * @param {number} baseCpS base cookies per second, passed in by the caller
     * @param {AbortSignal} signal
     * @returns {Promise<GameState>} the run process promise.
     */
    async run(objective, baseCpS, signal) {
        if (this.#isRunning) return this.#runPromise;
        this.#isRunning = true;
        const gameState = new GameState(baseCpS);

        this.#runPromise = (async () => {
            const data = [];
            let iterations = 0;
            const awaitIteration = 500;

            try {
                while (true) {
                    if (signal.aborted) return data;

                    // This now checks, if the objective is completed, and breaks if it is.
                    if (objective.isCompleted(gameState)) {
                        console.log("TEST: Objective Completed");
                        break;
                    }
                    // Filter buildings for buildings that reached max level
                    // or reached price of infinity
                    const validBuildings = filterValid(gameState.buildings);

                    // Break the loop if no more buildings are available
                    if (Object.keys(validBuildings).length === 0) {
                        console.log(
                            "All buildings have reached max level or price of infinity. Terminating algorithm...",
                        );
                        break;
                    }

                    // Choose a decision based on current policy/algorithm
                    const decision = await this.getNextDecision(
                        gameState,
                        objective,
                        validBuildings,
                        signal,
                    );

                    // Break the loop if the decision i invalid
                    if (!decision.isValid) {
                        console.log(
                            "Error: Invalid decision. Terminating algorithm...",
                        );
                        break;
                    }

                    // Perform the decision
                    decision.perform();

                    const gameStateCopy = gameState.copy();
                    data.push({ decision: decision, gameState: gameStateCopy });

                    const shouldYield = iterations % awaitIteration === 0;
                    if (shouldYield) await yieldFrame();
                    iterations++;
                }
            } finally {
                this.#isRunning = false;
                this.#runPromise = null;
            }

            return data;
        })();

        return this.#runPromise;
    }
}
