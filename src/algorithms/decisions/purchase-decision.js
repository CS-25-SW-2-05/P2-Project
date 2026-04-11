import Decision from "./decision.js";

export default class PurchaseDecision extends Decision {
	purchaseable = null;

	/**
	 * @param {GameState} gameState
	 * @param {Purchasable} purchaseable
	 */
	constructor(gameState, purchaseable) {
		super(gameState);

		this.purchaseable = purchaseable;
		this._wait = purchaseable.cost / gameState.cps;
		this.isValid =
			this.purchaseable != null &&
			this.purchaseable.canPurchase() &&
			this._wait > 0;
	}

	perform() {
		this.beforeCookies = this.gameState.cookies;
		this.gameState.simulationTime += this._wait;
		this.gameState.cookies += this.purchaseable.cost;
		this.afterCookies = this.gameState.cookies;

		const wasSuccesful = this.purchaseable.purchase(this.gameState);
		console.log("Result:", this.gameState);
		return wasSuccesful;
	}
}
