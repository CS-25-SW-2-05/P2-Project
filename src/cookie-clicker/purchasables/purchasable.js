import GameState from "../game-state.js";

export default class Purchasable {
	name = "";
	cost = 0;

	/**
	 * @param {string} name the name of the purchaseable.
	 * @param {number} cost the cost of the purchaseable.
	 */
	constructor(name, cost) {
		if (new.target == Purchasable)
			throw new Error(
				"Cannot instantiate abstract class Purchasable directly.",
			);

		this.name = name;
		this.cost = cost;
	}

	/**
	 *  Calculates and updates the cost using the Cookie Clicker cost formula.
	 */
	updateCost() {
		throw new Error(
			`Method '${this.updateCost.name}' must be implemented by subclass.`,
		);
	}

	/**
	 * Abstract method which is called right before the game state updates.
	 * @param {GameState} gameState the current game state.
	 */
	onPurchase(gameState) {
		throw new Error(
			`Method '${this.onPurchase.name}' must be implemented by subclass.`,
		);
	}
	/**
	 * Abstract method which determines whether the the purchaseable can be purchased. \
	 * This method should not include checking whether the game state has enough cookies.
	 * @returns {boolean} whether the purchase is valid.
	 */
	canPurchase() {
		throw new Error(
			`Method '${this.canPurchase.name}' must be implemented by subclass.`,
		);
	}

	/**
	 * Performs the purchase, if it is valid.
	 * @param {GameState} gameState the current game state.
	 * @returns {boolean} whether the purchase was performed.
	 */
	purchase(gameState) {
		if (!this.canPurchase()) return false;
		const canAfford = this.cost <= gameState.cookies;
		if (!canAfford) return false;

		this.onPurchase(gameState);
		gameState.cookies -= this.cost;
		this.updateCost();
		return true;
	}
}
