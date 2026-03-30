export default class GameState {
	#cookies = 0;
	totalCookies = 0;
	cps = 0;
	manualCpS = 6;
	realTime = 0;

	set cookies(value) {
		const change = value - this.#cookies;
		this.#cookies = value;

		if (change < 0) return;
		this.totalCookies += change;
	}

	get cookies() {
		return this.#cookies;
	}
}
