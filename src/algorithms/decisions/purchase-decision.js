import Decision from "./decision.js";

export default class PurchaseDecision extends Decision {
	#purchaseable = null;

	/**
	 * @param {GameState} gameState
	 * @param {Purchasable} purchaseable
	 */
	constructor(gameState, purchaseable) {
		super(gameState);

		this.#purchaseable = purchaseable;
		this._wait = purchaseable.cost / gameState.cps;
		this.isValid =
			this.#purchaseable != null &&
			this.#purchaseable.canPurchase() &&
			this._wait > 0;
	}

	perform() {
		console.log("Decision:", this);

		this._gameState.realTime += this._wait;
		this._gameState.cookies += this.#purchaseable.cost;

		this.#purchaseable.purchase(this._gameState);
		console.log("Result:", this._gameState);
	}
}
