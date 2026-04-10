export default class GameState {
	#cookies = 0;
	totalCookies = 0;
	buildingCpS = 0;
	manualCpS = 1;
	simulationTime = 0;

	constructor(manualCpS = 1) {
		this.manualCpS = manualCpS;
	}

	/**
	 * @param {GameState} gameState
	 * @returns {GameState} a copy of the game state.
	 */
	copy() {
		const copy = new GameState();
		copy.#cookies = this.#cookies;
		copy.totalCookies = this.totalCookies;
		copy.buildingCpS = this.buildingCpS;
		copy.manualCpS = this.manualCpS;
		copy.simulationTime = this.simulationTime;

		return copy;
	}

	set cookies(value) {
		const change = value - this.#cookies;
		this.#cookies = value;

		if (change < 0) return;
		this.totalCookies += change;
	}

	get cookies() {
		return this.#cookies;
	}

	get cps() {
		return this.buildingCpS + this.manualCpS;
	}
}
