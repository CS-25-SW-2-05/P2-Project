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
		this.beforeCookies = this._gameState.cookies;
		this._gameState.simulationTime += this._wait;
		this._gameState.cookies += this._gameState.cps * this._wait;
		this.afterCookies = this._gameState.cookies;

		//console.log("Result:", this._gameState);
		return true;
	}
}
