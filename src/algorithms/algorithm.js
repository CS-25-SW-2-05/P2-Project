import GameState from "../cookie-clicker/game-state.js";
import { cloneBuildings } from "../cookie-clicker/purchasables/building.js";
import { sleep } from "../utils.js";

export default class Algorithm {
	static derived = new Set();
	#isRunning = false;
	#runPromise = null;

	constructor() {
		if (new.target != Algorithm) return;
		throw new Error("Cannot instantiate abstract class Algorithm directly.");
	}

	getNextDecision(game, buildings) {
		throw new Error(
			`Method '${this.getNextDecision.name}' must be implemented by subclass.`,
		);
	}

	async run() {
		if (this.#isRunning) return this.#runPromise;
		this.#isRunning = true;

		const gameState = new GameState();
		const buildings = cloneBuildings();

		this.#runPromise = (async () => {
			while (true) {
				const decision = this.getNextDecision(gameState, buildings);
				if (!decision.isValid) break;
				decision.perform();
				await sleep(0);
			}
			this.#isRunning = false;
			this.#runPromise = null;
		})();

		return this.#runPromise;
	}
}
