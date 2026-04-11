import Decision from "./decision.js";

export default class WaitDecision extends Decision {
	/**
	 * @param {GameState} gameState
	 * @param {number} wait
	 */
	constructor(gameState, wait) {
		super(gameState);

		this._wait = wait;
		this.isValid = this._wait > 0;
	}

	perform() {
		this.beforeCookies = this.gameState.cookies;
		this.gameState.simulationTime += this._wait;
		this.gameState.cookies += this.gameState.cps * this._wait;
		this.afterCookies = this.gameState.cookies;

		console.log("Result:", this.gameState);
		return true;
	}
}
