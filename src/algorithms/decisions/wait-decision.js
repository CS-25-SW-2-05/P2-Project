import Decision from "./decision";

export default class PurchaseDecision extends Decision {
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
		console.log("Decision:", this);

		this._gameState.realTime += this._wait;
		this._gameState.cookies += this._gameState.cps * this._wait;

		console.log("Result:", this._gameState);
	}
}
