import Game from "../cookie-clicker/game.js";

export default class Decision {
	isValid = false;
	#purchaseable = null;
	#wait = 0;

	constructor(purchaseable) {
		this.#purchaseable = purchaseable;
		this.#wait = purchaseable.cost / Game.cps;
		this.isValid =
			this.#purchaseable != null &&
			this.#purchaseable.canPurchase() &&
			this.#wait > 0;
	}

	perform() {
		console.log(
			"Decision:",
			this.#purchaseable.name,
			"after",
			this.#wait + "s",
		);

		Game.realTime += this.#wait;
		Game.cookies += this.#purchaseable.cost;

		this.#purchaseable.purchase();
	}
}
