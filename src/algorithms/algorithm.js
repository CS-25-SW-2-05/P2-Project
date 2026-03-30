import GameState from "../cookie-clicker/game-state.js";
import Building, {
	cloneBuildings,
} from "../cookie-clicker/purchasables/building.js";
import { sleep } from "../utils.js";
import Decision from "./decision.js";
import Objective from "./objective.js";

export default class Algorithm {
	static derived = new Set();
	#isRunning = false;
	#runPromise = null;

	constructor() {
		if (new.target != Algorithm) return;
		throw new Error("Cannot instantiate abstract class Algorithm directly.");
	}

	/**
	 * @param {GameState} game the current game state
	 * @param {Building} buildings a list of all buildings, in their current state
	 * @returns {Decision} the next decision to be performed, if it is valid.
	 */
	getNextDecision(game, buildings) {
		throw new Error(
			`Method '${this.getNextDecision.name}' must be implemented by subclass.`,
		);
	}
	//  "objective" parameter is passed in from script.js when the form is submitted
	async run(objective) {

	/**
	 * Run the algorithm until a non-valid decision occurs.
	 * @returns {Promise<GameState>} the run process promise.
	 */
	async run() {
		if (this.#isRunning) return this.#runPromise;
		this.#isRunning = true;

		const gameState = new GameState();
		const buildings = cloneBuildings();

		this.#runPromise = (async () => {
			while (true) {
				// This now checks, if the objective is completed, and breaks.
				if (objective.isCompleted(gameState)){
					console.log("TEST: Objective Completed");
					break;
				}	
				const decision = this.getNextDecision(gameState, buildings);
				if (!decision.isValid) break;
				// To do:
				// If objectiveCompleted break;
				decision.perform();
				await sleep(0);
			}
			this.#isRunning = false;
			this.#runPromise = null;

			return gameState;
		})();

		return this.#runPromise;
	}
}
