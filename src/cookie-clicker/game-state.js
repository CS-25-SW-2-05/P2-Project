export default class GameState {
	#cookies = 0;
	totalCookies = 0;
	buildingCpS = 0;
	manualCpS = 6;
	realTime = 0;

	/**
	 * @param {GameState} gameState
	 * @returns {GameState} a copy of the game state.
	 */
	copy() {
		const copy = Object.assign(
			Object.create(Object.getPrototypeOf(this)),
			this,
		);

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
