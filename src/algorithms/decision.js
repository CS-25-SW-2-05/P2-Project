import GameState from "../cookie-clicker/game-state.js";
import Purchasable from "../cookie-clicker/purchasables/purchasable.js";

export default class Decision {
	isValid = false;
	#gameState = null;
	#purchaseable = null;
	#wait = 0;

	/**
	 * @param {GameState} gameState
	 * @param {Purchasable} purchaseable
	 */
	constructor(gameState, purchaseable) {
		this.#gameState = gameState;
		this.#purchaseable = purchaseable;
		this.#wait = purchaseable.cost / (gameState.cps + gameState.manualCpS);

		this.isValid =
			this.#purchaseable != null &&
			this.#purchaseable.canPurchase() &&
			this.#wait > 0;
	}

	/**
	 * Perform the decision, and update the game state.
	 */
	perform() {
		console.log("Decision:", this);

		this.#gameState.realTime += this.#wait;
		this.#gameState.cookies += this.#purchaseable.cost;

		this.#purchaseable.purchase(this.#gameState);
		console.log("Result:", this.#gameState);
	}
}
